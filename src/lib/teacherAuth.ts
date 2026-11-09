import { doc, getDoc, setDoc } from "firebase/firestore";
import { db, appId } from "./firebase";
import { Teacher } from "../types";

export const MAX_DAILY_OTP = 5;
export const OTP_COOLDOWN_MS = 60 * 1000; // 60 seconds
export const OTP_VALIDITY_MS = 5 * 60 * 1000; // 5 minutes
export const MAX_OTP_ATTEMPTS = 3;

const SESSION_STORAGE_KEY = "tc_teacher_verified_sessions_v1";

export interface TeacherAuthRecord {
  phone: string;
  otpHash?: string;
  expiresAt?: number;
  attempts?: number;
  dailyCount?: number;
  dailyResetDate?: string;
  lastSentAt?: number;
  isVerified?: boolean;
  pinHash?: string;
  updatedAt?: number;
}

export function normalizeBdPhone(rawPhone: string): string {
  const digits = rawPhone.replace(/\D/g, "");
  if (digits.startsWith("880") && digits.length === 13) {
    return digits.slice(2);
  }
  if (digits.length === 10 && digits.startsWith("1")) {
    return `0${digits}`;
  }
  return digits;
}

export function getTodayDateKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}-v2`;
}

export async function sha256Hash(value: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(`tc_salt_2026_${value}`);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function getSavedTeacherSession(phone: string): boolean {
  try {
    const clean = normalizeBdPhone(phone);
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return false;
    const map = JSON.parse(raw) as Record<string, { verifiedAt: number }>;
    return Boolean(map[clean]?.verifiedAt);
  } catch {
    return false;
  }
}

export function saveTeacherSession(phone: string): void {
  try {
    const clean = normalizeBdPhone(phone);
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    const map = raw ? (JSON.parse(raw) as Record<string, { verifiedAt: number }>) : {};
    map[clean] = { verifiedAt: Date.now() };
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(map));
  } catch (e) {
    console.error("Failed to save teacher session:", e);
  }
}

export function clearTeacherSession(phone: string): void {
  try {
    const clean = normalizeBdPhone(phone);
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return;
    const map = JSON.parse(raw) as Record<string, { verifiedAt: number }>;
    delete map[clean];
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(map));
  } catch (e) {
    console.error("Failed to clear teacher session:", e);
  }
}

export async function getTeacherAuthState(phone: string): Promise<{
  record: TeacherAuthRecord;
  remainingToday: number;
  cooldownRemainingSec: number;
}> {
  const cleanPhone = normalizeBdPhone(phone);
  const authRef = doc(db, "artifacts", appId, "public", "data", "tc_teacher_auth", cleanPhone);
  const snap = await getDoc(authRef);
  const today = getTodayDateKey();

  const record: TeacherAuthRecord = snap.exists()
    ? (snap.data() as TeacherAuthRecord)
    : { phone: cleanPhone, dailyCount: 0, dailyResetDate: today, isVerified: false };

  const usedToday = record.dailyResetDate === today ? (record.dailyCount || 0) : 0;
  const remainingToday = Math.max(0, MAX_DAILY_OTP - usedToday);

  const elapsedSinceLast =
    record.dailyResetDate === today && record.lastSentAt
      ? Date.now() - record.lastSentAt
      : OTP_COOLDOWN_MS;
  const cooldownRemainingSec =
    elapsedSinceLast < OTP_COOLDOWN_MS
      ? Math.ceil((OTP_COOLDOWN_MS - elapsedSinceLast) / 1000)
      : 0;

  return {
    record: {
      ...record,
      phone: cleanPhone,
      dailyCount: usedToday,
      dailyResetDate: today,
    },
    remainingToday,
    cooldownRemainingSec,
  };
}

export async function requestTeacherOtp(phone: string): Promise<{
  success: boolean;
  mode?: "live" | "sandbox";
  demoOtp?: string;
  gatewayNotice?: string;
  serverIp?: string;
  message: string;
  remainingToday: number;
  expiresAt: number;
}> {
  const cleanPhone = normalizeBdPhone(phone);
  const { record, remainingToday, cooldownRemainingSec } = await getTeacherAuthState(cleanPhone);

  if (cooldownRemainingSec > 0) {
    throw new Error(`অনুগ্রহ করে ${cooldownRemainingSec} সেকেন্ড অপেক্ষা করে আবার চেষ্টা করুন।`);
  }

  if (remainingToday <= 0) {
    throw new Error(
      `আজকের সর্বোচ্চ ওটিপি লিমিট (${MAX_DAILY_OTP} বার) শেষ হয়েছে। পূর্বে সেট করা পিন দিয়ে লগইন করুন অথবা আগামীকাল চেষ্টা করুন।`
    );
  }

  // Generate 4-digit OTP matching BulkSMSBD template: (Your {Brand/Company Name} OTP is XXXX)
  const otp = String(Math.floor(1000 + Math.random() * 9000));
  const otpHash = await sha256Hash(otp);
  const now = Date.now();
  const expiresAt = now + OTP_VALIDITY_MS;
  const today = getTodayDateKey();
  const newDailyCount = (record.dailyResetDate === today ? (record.dailyCount || 0) : 0) + 1;

  let mode: "live" | "sandbox" = "live";
  let demoOtp: string | undefined = undefined;
  let gatewayNotice: string | undefined = undefined;
  let serverIp: string | undefined = undefined;
  let message = `${cleanPhone} নম্বরে OTP পাঠানো হয়েছে।`;

  try {
    const response = await fetch("/api/otp/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: cleanPhone, otp }),
    });

    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "ওটিপি পাঠাতে সমস্যা হয়েছে।");
      }
      mode = data.mode || "live";
      demoOtp = data.demoOtp;
      gatewayNotice = data.gatewayNotice;
      serverIp = data.serverIp;
      message = data.message;
    } else {
      // Fallback for Netlify static hosting via /api/bulksms edge redirect
      const intlPhone = `88${cleanPhone}`;
      const smsMessage = `Your Teachers Corner OTP is ${otp}`;
      const apiKey = (import.meta as any).env?.VITE_SMS_API_KEY || "4imlJiQWPaDjZyQnTBCK";
      const senderId = (import.meta as any).env?.VITE_SMS_SENDER_ID || "8809617634959";

      const params = new URLSearchParams({
        api_key: apiKey,
        type: "text",
        number: intlPhone,
        senderid: senderId,
        message: smsMessage,
      });

      const proxyRes = await fetch(`/api/bulksms?${params.toString()}`);
      const proxyText = await proxyRes.text();
      try {
        const parsed = JSON.parse(proxyText);
        const code = Number(parsed.response_code || 0);
        if (code !== 202 && code !== 200) {
          const note = String(parsed.error_message || "");
          const ipMatch = note.match(/\b(?:\d{1,3}\.){3}\d{1,3}\b/);
          serverIp = ipMatch ? ipMatch[0] : "34.34.244.77";
          mode = "sandbox";
          demoOtp = otp;
          gatewayNotice =
            code === 1032
              ? `BulkSMSBD প্যানেলে সার্ভার IP (${serverIp}) Whitelist করা নেই। bulksmsbd.net-এর Phonebook থেকে এই IP-টি Whitelist করলে সরাসরি ফোনে SMS যাবে।`
              : `BulkSMSBD কোড (${code}): ${note}`;
        }
      } catch {
        mode = "sandbox";
        demoOtp = otp;
      }
    }
  } catch {
    mode = "sandbox";
    demoOtp = otp;
  }

  // Save OTP state & rate limit counter in Firestore
  const authRef = doc(db, "artifacts", appId, "public", "data", "tc_teacher_auth", cleanPhone);
  const updatedRecord: TeacherAuthRecord = {
    ...record,
    phone: cleanPhone,
    otpHash,
    expiresAt,
    attempts: 0,
    dailyCount: newDailyCount,
    dailyResetDate: today,
    lastSentAt: now,
    updatedAt: now,
  };

  await setDoc(authRef, updatedRecord);

  return {
    success: true,
    mode,
    demoOtp,
    gatewayNotice,
    serverIp,
    message,
    remainingToday: Math.max(0, MAX_DAILY_OTP - newDailyCount),
    expiresAt,
  };
}

export async function verifyTeacherOtpCode(phone: string, code: string): Promise<{
  hasExistingPin: boolean;
}> {
  const cleanPhone = normalizeBdPhone(phone);
  const authRef = doc(db, "artifacts", appId, "public", "data", "tc_teacher_auth", cleanPhone);
  const snap = await getDoc(authRef);

  if (!snap.exists()) {
    throw new Error("কোনো সক্রিয় ওটিপি পাওয়া যায়নি। প্রথমে ওটিপি পাঠান।");
  }

  const record = snap.data() as TeacherAuthRecord;

  if (!record.otpHash || !record.expiresAt) {
    throw new Error("কোনো সক্রিয় ওটিপি নেই। পুনরায় ওটিপি পাঠান।");
  }

  if (Date.now() > record.expiresAt) {
    throw new Error("ওটিপির মেয়াদ (৫ মিনিট) শেষ হয়ে গেছে। নতুন ওটিপি পাঠান।");
  }

  const currentAttempts = record.attempts || 0;
  if (currentAttempts >= MAX_OTP_ATTEMPTS) {
    throw new Error("সর্বোচ্চ ৩ বার ভুল কোড দেওয়া হয়েছে। নতুন ওটিপি পাঠান।");
  }

  const inputHash = await sha256Hash(code.trim());
  if (inputHash !== record.otpHash) {
    const nextAttempts = currentAttempts + 1;
    await setDoc(authRef, {
      ...record,
      phone: cleanPhone,
      attempts: nextAttempts,
      updatedAt: Date.now(),
    });
    const left = MAX_OTP_ATTEMPTS - nextAttempts;
    throw new Error(
      left > 0
        ? `ভুল ওটিপি কোড! আপনার আরও ${left} বার চেষ্টা বাকি আছে।`
        : "৩ বার ভুল কোড দেওয়ায় এই ওটিপি বাতিল হয়েছে। নতুন ওটিপি পাঠান।"
    );
  }

  // OTP verified! Mark phone as verified & clear active OTP
  await setDoc(authRef, {
    ...record,
    phone: cleanPhone,
    otpHash: "",
    expiresAt: 0,
    attempts: 0,
    isVerified: true,
    updatedAt: Date.now(),
  });

  saveTeacherSession(cleanPhone);

  return {
    hasExistingPin: Boolean(record.pinHash),
  };
}

export async function setTeacherDashboardPin(phone: string, pin: string): Promise<void> {
  const cleanPhone = normalizeBdPhone(phone);
  if (!/^\d{4,6}$/.test(pin.trim())) {
    throw new Error("অনুগ্রহ করে ৪ থেকে ৬ ডিজিটের সংখ্যার পিন দিন।");
  }

  const authRef = doc(db, "artifacts", appId, "public", "data", "tc_teacher_auth", cleanPhone);
  const snap = await getDoc(authRef);
  const existing = snap.exists() ? (snap.data() as TeacherAuthRecord) : { phone: cleanPhone };
  const pinHash = await sha256Hash(pin.trim());

  await setDoc(authRef, {
    ...existing,
    phone: cleanPhone,
    isVerified: true,
    pinHash,
    updatedAt: Date.now(),
  });

  saveTeacherSession(cleanPhone);
}

export async function loginTeacherWithPin(phone: string, pin: string): Promise<boolean> {
  const cleanPhone = normalizeBdPhone(phone);
  const authRef = doc(db, "artifacts", appId, "public", "data", "tc_teacher_auth", cleanPhone);
  const snap = await getDoc(authRef);

  if (!snap.exists()) {
    throw new Error("এই নম্বরে এখনো ওটিপি ভেরিফিকেশন সম্পন্ন হয়নি। প্রথমে ওটিপি দিয়ে ভেরিফাই করুন।");
  }

  const record = snap.data() as TeacherAuthRecord;
  if (!record.isVerified || !record.pinHash) {
    throw new Error("এই নম্বরে কোনো ড্যাশবোর্ড পিন সেট করা নেই। ওটিপি দিয়ে পিন সেট করুন।");
  }

  const inputPinHash = await sha256Hash(pin.trim());
  if (inputPinHash !== record.pinHash) {
    throw new Error("ভুল পিন কোড! সঠিক পিন দিন অথবা ওটিপি দিয়ে রিসেট করুন।");
  }

  saveTeacherSession(cleanPhone);
  return true;
}

export async function fetchFullTeacherProfile(teacherId: string): Promise<Teacher | null> {
  const teacherRef = doc(db, "artifacts", appId, "public", "data", "tc_teachers", teacherId);
  const snap = await getDoc(teacherRef);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Teacher;
}
