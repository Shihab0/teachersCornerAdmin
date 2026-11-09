import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Phone,
  Search,
  GraduationCap,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
  School,
  ShieldCheck,
  Lock,
  MessageSquare,
  KeyRound,
  FileEdit,
  Send,
  RefreshCw,
  LogOut,
  ArrowLeft,
  Check,
} from "lucide-react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db, appId } from "../../lib/firebase";
import { toast } from "sonner";
import { normalizePhoneVariations } from "../../lib/utils";
import { Teacher } from "../../types";
import {
  MAX_DAILY_OTP,
  TeacherAuthRecord,
  normalizeBdPhone,
  getTeacherAuthState,
  requestTeacherOtp,
  verifyTeacherOtpCode,
  setTeacherDashboardPin,
  loginTeacherWithPin,
  getSavedTeacherSession,
  clearTeacherSession,
  fetchFullTeacherProfile,
} from "../../lib/teacherAuth";

interface TeacherStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenNewTeacherModal: () => void;
  onEditTeacher?: (teacher: Teacher) => void;
}

interface PublicTeacherStatus {
  id: string;
  name: string;
  status: "Pending" | "Approved" | "Rejected";
  adminMessage: string;
  collegeName: string;
  photoUrl: string;
}

type ModalSubView = "status" | "otp_verify" | "set_pin" | "pin_login" | "dashboard";

export const TeacherStatusModal: React.FC<TeacherStatusModalProps> = ({
  isOpen,
  onClose,
  onOpenNewTeacherModal,
  onEditTeacher,
}) => {
  const [phone, setPhone] = useState("");
  const [searchedPhone, setSearchedPhone] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [foundTeachers, setFoundTeachers] = useState<PublicTeacherStatus[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const [subView, setSubView] = useState<ModalSubView>("status");
  const [authRecord, setAuthRecord] = useState<TeacherAuthRecord | null>(null);
  const [remainingOtpToday, setRemainingOtpToday] = useState<number>(MAX_DAILY_OTP);
  const [cooldownSec, setCooldownSec] = useState<number>(0);
  const [expirySec, setExpirySec] = useState<number>(0);
  const [isSessionVerified, setIsSessionVerified] = useState<boolean>(false);

  const [otpCode, setOtpCode] = useState("");
  const [hasSentOtpInSession, setHasSentOtpInSession] = useState(false);
  const [sandboxOtpHint, setSandboxOtpHint] = useState<string | null>(null);
  const [gatewayNotice, setGatewayNotice] = useState<string | null>(null);
  const [pinCode, setPinCode] = useState("");
  const [isProcessingAuth, setIsProcessingAuth] = useState(false);

  const [activeTeacherId, setActiveTeacherId] = useState<string | null>(null);
  const [fullTeacherProfile, setFullTeacherProfile] = useState<Teacher | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  useEffect(() => {
    if (cooldownSec <= 0 && expirySec <= 0) return;
    const timer = setInterval(() => {
      setCooldownSec((prev) => (prev > 0 ? prev - 1 : 0));
      setExpirySec((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownSec, expirySec]);

  useEffect(() => {
    if (!isOpen) {
      setSubView("status");
      setOtpCode("");
      setPinCode("");
      setSandboxOtpHint(null);
      setGatewayNotice(null);
      setHasSentOtpInSession(false);
    }
  }, [isOpen]);

  const loadFullTeacherForDashboard = async (teacherId: string, fallbackSummary?: PublicTeacherStatus) => {
    setIsLoadingProfile(true);
    try {
      const full = await fetchFullTeacherProfile(teacherId);
      if (full) {
        setFullTeacherProfile(full);
      } else if (fallbackSummary) {
        setFullTeacherProfile({
          id: fallbackSummary.id,
          name: fallbackSummary.name,
          phone: searchedPhone,
          photoUrl: fallbackSummary.photoUrl || "",
          collegeName: fallbackSummary.collegeName || "",
          presentAddress: "",
          permanentAddress: "",
          education: {
            ssc: { year: "", group: "", gpa: "" },
            hsc: { year: "", group: "", gpa: "" },
            honours: { year: "", subject: "", studyYear: "", gpa: "" },
          },
          experience: "",
          hasCurrentTuition: false,
          interestedSubjectsAndClasses: "",
          isMedical: false,
          isPublicUniversity: false,
          canTeachHSC: false,
          rating: 5.0,
          createdAt: Date.now(),
          status: fallbackSummary.status,
          adminMessage: fallbackSummary.adminMessage,
        });
      }
    } catch (err) {
      console.error("Failed to fetch full teacher profile:", err);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const rawPhone = phone.trim();
    if (!rawPhone || rawPhone.replace(/\D/g, "").length < 10) {
      toast.error("সঠিক মোবাইল নম্বর দিন");
      return;
    }

    const cleanPhone = normalizeBdPhone(rawPhone);
    setSearchedPhone(cleanPhone);
    setIsSearching(true);
    setFoundTeachers([]);
    setHasSearched(true);
    setSubView("status");
    setOtpCode("");
    setPinCode("");
    setSandboxOtpHint(null);
    setHasSentOtpInSession(false);

    try {
      const variations = normalizePhoneVariations(rawPhone);
      const q = query(
        collection(db, "artifacts", appId, "public", "data", "tc_teacher_public_status"),
        where("phone", "in", variations)
      );

      const querySnapshot = await getDocs(q);

      let allApps: PublicTeacherStatus[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.applications && Array.isArray(data.applications)) {
          allApps = [...allApps, ...data.applications];
        }
      });

      if (allApps.length === 0) {
        try {
          const qApproved = query(
            collection(db, "artifacts", appId, "public", "data", "tc_teachers"),
            where("phone", "in", variations),
            where("status", "==", "Approved")
          );
          const approvedSnap = await getDocs(qApproved);
          approvedSnap.forEach((docSnap) => {
            const d = docSnap.data() as Teacher;
            allApps.push({
              id: docSnap.id,
              name: d.name,
              status: d.status || "Approved",
              adminMessage: d.adminMessage || "",
              collegeName: d.collegeName || "",
              photoUrl: d.photoUrl || "",
            });
          });
        } catch {
          // Ignore fallback query error
        }
      }

      if (allApps.length > 0) {
        setFoundTeachers(allApps);
        setActiveTeacherId(allApps[0].id);

        const authState = await getTeacherAuthState(cleanPhone);
        setAuthRecord(authState.record);
        setRemainingOtpToday(authState.remainingToday);
        setCooldownSec(authState.cooldownRemainingSec);

        const savedSession = getSavedTeacherSession(cleanPhone);
        setIsSessionVerified(savedSession);
      } else {
        setFoundTeachers([]);
        setActiveTeacherId(null);
      }
    } catch (error) {
      console.error("Error searching teacher status:", error);
      toast.error("স্ট্যাটাস খুঁজতে সমস্যা হয়েছে।");
    } finally {
      setIsSearching(false);
    }
  };

  const handleNeedUpdateClick = async (targetTeacher?: PublicTeacherStatus) => {
    const chosen = targetTeacher || foundTeachers[0];
    if (!chosen) return;
    setActiveTeacherId(chosen.id);

    if (isSessionVerified) {
      setSubView("dashboard");
      await loadFullTeacherForDashboard(chosen.id, chosen);
      return;
    }

    if (authRecord?.isVerified && authRecord?.pinHash) {
      setSubView("pin_login");
      return;
    }

    setSubView("otp_verify");
  };

  const handleSendOtp = async () => {
    if (!searchedPhone) return;
    setIsProcessingAuth(true);
    setSandboxOtpHint(null);
    setGatewayNotice(null);
    try {
      const res = await requestTeacherOtp(searchedPhone);
      setRemainingOtpToday(res.remainingToday);
      setCooldownSec(60);
      setExpirySec(300);
      setHasSentOtpInSession(true);

      if (res.gatewayNotice) {
        setGatewayNotice(res.gatewayNotice);
      }

      if (res.mode === "sandbox" && res.demoOtp) {
        setSandboxOtpHint(res.demoOtp);
        setOtpCode(res.demoOtp);
        toast.success(`OTP কোড: ${res.demoOtp} (স্বয়ংক্রিয়ভাবে বসানো হয়েছে)`);
      } else {
        toast.success(res.message);
      }
    } catch (error: any) {
      toast.error(error?.message || "ওটিপি পাঠাতে সমস্যা হয়েছে।");
    } finally {
      setIsProcessingAuth(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.trim().length < 4) {
      toast.error("৪-ডিজিটের ওটিপি দিন।");
      return;
    }

    setIsProcessingAuth(true);
    try {
      await verifyTeacherOtpCode(searchedPhone, otpCode);
      setIsSessionVerified(true);
      const updatedState = await getTeacherAuthState(searchedPhone);
      setAuthRecord(updatedState.record);
      toast.success("ওটিপি ভেরিফাইড হয়েছে!");
      setSubView("set_pin");
    } catch (error: any) {
      toast.error(error?.message || "ওটিপি সঠিক নয়।");
    } finally {
      setIsProcessingAuth(false);
    }
  };

  const handleSavePinAndOpenDashboard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{4,6}$/.test(pinCode.trim())) {
      toast.error("৪ ডিজিটের পিন দিন (যেমন: 1234)");
      return;
    }

    setIsProcessingAuth(true);
    try {
      await setTeacherDashboardPin(searchedPhone, pinCode);
      const updatedState = await getTeacherAuthState(searchedPhone);
      setAuthRecord(updatedState.record);
      setIsSessionVerified(true);
      toast.success("পিন সেট সম্পন্ন! পরবর্তীতে OTP ছাড়াই লগইন করতে পারবেন।");

      const chosen = foundTeachers.find((t) => t.id === activeTeacherId) || foundTeachers[0];
      setSubView("dashboard");
      if (chosen) {
        await loadFullTeacherForDashboard(chosen.id, chosen);
      }
    } catch (error: any) {
      toast.error(error?.message || "পিন সেভ করতে সমস্যা হয়েছে।");
    } finally {
      setIsProcessingAuth(false);
    }
  };

  const handleSkipPinToDashboard = async () => {
    const chosen = foundTeachers.find((t) => t.id === activeTeacherId) || foundTeachers[0];
    setSubView("dashboard");
    if (chosen) {
      await loadFullTeacherForDashboard(chosen.id, chosen);
    }
  };

  const handlePinLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinCode || pinCode.trim().length < 4) {
      toast.error("আপনার পিন কোড দিন।");
      return;
    }

    setIsProcessingAuth(true);
    try {
      await loginTeacherWithPin(searchedPhone, pinCode);
      setIsSessionVerified(true);
      toast.success("ড্যাশবোর্ডে লগইন সফল!");

      const chosen = foundTeachers.find((t) => t.id === activeTeacherId) || foundTeachers[0];
      setSubView("dashboard");
      if (chosen) {
        await loadFullTeacherForDashboard(chosen.id, chosen);
      }
    } catch (error: any) {
      toast.error(error?.message || "ভুল পিন কোড!");
    } finally {
      setIsProcessingAuth(false);
    }
  };

  const handleLogoutDashboard = () => {
    clearTeacherSession(searchedPhone);
    setIsSessionVerified(false);
    setPinCode("");
    setSubView("status");
    toast.info("লগআউট সম্পন্ন।");
  };

  const handleOpenCvEditor = () => {
    if (!fullTeacherProfile) {
      toast.error("তথ্য লোড হয়নি, আবার চেষ্টা করুন।");
      return;
    }
    if (onEditTeacher) {
      onClose();
      onEditTeacher(fullTeacherProfile);
    }
  };

  const formatCountdown = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh] border border-slate-200/80 dark:border-slate-800"
        >
          {/* Minimalist Header */}
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-900 dark:bg-slate-950 text-white shrink-0">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <h3 className="text-sm font-black tracking-tight">
                {subView === "dashboard" ? "টিচার ড্যাশবোর্ড" : "সিভি স্ট্যাটাস ও আপডেট"}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          <div className="p-5 overflow-y-auto no-scrollbar space-y-4">
            {/* Search Input Form */}
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="মোবাইল নম্বর (01XXXXXXXXX)"
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-emerald-500 outline-none text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400 font-mono tabular-nums"
                />
              </div>
              <button
                type="submit"
                disabled={isSearching}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs transition-all disabled:opacity-50 flex items-center gap-1.5 shrink-0 whitespace-nowrap cursor-pointer"
              >
                {isSearching ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
                সার্চ
              </button>
            </form>

            {/* Results Section */}
            {hasSearched && (
              <div className="space-y-3">
                {foundTeachers.length > 0 ? (
                  <>
                    {/* Minimalist Top Bar with "Need Update" button */}
                    <div className="px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                        {subView === "status"
                          ? "সিভির তথ্য পরিবর্তন প্রয়োজন?"
                          : `নম্বর: ${searchedPhone}`}
                      </span>

                      {subView === "status" ? (
                        <button
                          type="button"
                          onClick={() => handleNeedUpdateClick(foundTeachers[0])}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-black text-xs transition-all flex items-center gap-1.5 shrink-0 whitespace-nowrap cursor-pointer"
                        >
                          <FileEdit size={13} />
                          <span>Need Update</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setSubView("status")}
                          className="px-2.5 py-1 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg font-bold text-xs flex items-center gap-1 shrink-0 cursor-pointer"
                        >
                          <ArrowLeft size={12} />
                          <span>ব্যাক</span>
                        </button>
                      )}
                    </div>

                    {/* VIEW 1: STATUS LIST */}
                    {subView === "status" && (
                      <div className="space-y-3">
                        {foundTeachers.map((foundTeacher) => (
                          <div
                            key={foundTeacher.id}
                            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-11 h-11 rounded-xl bg-emerald-100 dark:bg-slate-800 overflow-hidden shrink-0 flex items-center justify-center">
                                  {foundTeacher.photoUrl ? (
                                    <img
                                      src={foundTeacher.photoUrl}
                                      alt={foundTeacher.name}
                                      className="w-full h-full object-cover"
                                      referrerPolicy="no-referrer"
                                    />
                                  ) : (
                                    <span className="text-emerald-600 font-black text-base">
                                      {foundTeacher.name.charAt(0)}
                                    </span>
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <h4 className="font-black text-slate-900 dark:text-white text-sm truncate">
                                    {foundTeacher.name}
                                  </h4>
                                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 truncate">
                                    <School size={11} className="text-emerald-500 shrink-0" />
                                    {foundTeacher.collegeName}
                                  </p>
                                </div>
                              </div>

                              {/* Clean Status Indicator */}
                              <div className="flex items-center gap-1 text-xs font-black shrink-0">
                                {foundTeacher.status === "Approved" && (
                                  <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                    <CheckCircle2 size={14} /> Approved
                                  </span>
                                )}
                                {foundTeacher.status === "Pending" && (
                                  <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                                    <Clock size={14} /> Pending
                                  </span>
                                )}
                                {foundTeacher.status === "Rejected" && (
                                  <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1">
                                    <XCircle size={14} /> Rejected
                                  </span>
                                )}
                              </div>
                            </div>

                            {foundTeacher.adminMessage && (
                              <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200/70 dark:border-blue-900/50 rounded-xl text-xs text-blue-900 dark:text-blue-200 flex items-start gap-2">
                                <MessageSquare size={14} className="text-blue-600 shrink-0 mt-0.5" />
                                <span>{foundTeacher.adminMessage}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* VIEW 2: MINIMALIST OTP VERIFICATION */}
                    {subView === "otp_verify" && (
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                            <KeyRound size={14} className="text-emerald-600" />
                            OTP ভেরিফিকেশন
                          </span>
                          <span className="text-[11px] font-mono tabular-nums text-slate-500">
                            লিমিট: {remainingOtpToday}/{MAX_DAILY_OTP}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={handleSendOtp}
                          disabled={isProcessingAuth || cooldownSec > 0 || remainingOtpToday <= 0}
                          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                          {isProcessingAuth ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : hasSentOtpInSession ? (
                            <RefreshCw size={14} />
                          ) : (
                            <Send size={14} />
                          )}
                          {cooldownSec > 0 ? (
                            <span className="font-mono tabular-nums">পুনরায় পাঠান ({cooldownSec}s)</span>
                          ) : hasSentOtpInSession ? (
                            "পুনরায় OTP পাঠান"
                          ) : (
                            "OTP পাঠান"
                          )}
                        </button>

                        {sandboxOtpHint && (
                          <div className="px-3 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 space-y-1.5 text-xs text-amber-900 dark:text-amber-200">
                            <div className="flex items-center justify-between">
                              <span className="font-bold">আপনার OTP কোড:</span>
                              <button
                                type="button"
                                onClick={() => setOtpCode(sandboxOtpHint)}
                                className="font-mono tabular-nums font-black text-sm tracking-widest text-emerald-700 dark:text-emerald-400 flex items-center gap-1 cursor-pointer"
                              >
                                <span>{sandboxOtpHint}</span>
                                <Check size={13} />
                              </button>
                            </div>
                            {gatewayNotice && (
                              <p className="text-[11px] leading-relaxed text-amber-800/90 dark:text-amber-300/90 border-t border-amber-200/60 dark:border-amber-800/50 pt-1.5">
                                {gatewayNotice}
                              </p>
                            )}
                          </div>
                        )}

                        <form onSubmit={handleVerifyOtp} className="flex gap-2">
                          <input
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            value={otpCode}
                            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                            placeholder="4-Digit OTP"
                            className="flex-1 px-3 py-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-center text-sm font-black tracking-[0.3em] font-mono tabular-nums text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                          />
                          <button
                            type="submit"
                            disabled={isProcessingAuth || otpCode.length < 4}
                            className="px-4 py-2.5 bg-slate-900 dark:bg-emerald-600 text-white rounded-xl font-black text-xs disabled:opacity-50 shrink-0 cursor-pointer"
                          >
                            ভেরিফাই {expirySec > 0 ? `(${formatCountdown(expirySec)})` : ""}
                          </button>
                        </form>

                        {authRecord?.isVerified && authRecord?.pinHash && (
                          <button
                            type="button"
                            onClick={() => setSubView("pin_login")}
                            className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline block text-right w-full cursor-pointer"
                          >
                            পিন দিয়ে OTP ছাড়াই লগইন করুন →
                          </button>
                        )}
                      </div>
                    )}

                    {/* VIEW 3: MINIMALIST PIN SETUP */}
                    {subView === "set_pin" && (
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
                        <div>
                          <h4 className="text-xs font-black text-slate-900 dark:text-white">
                            ড্যাশবোর্ড পিন সেট করুন (পরবর্তীতে OTP লাগবে না)
                          </h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            ৪-ডিজিট পিন দিলে পরের বার সরাসরি সিভি আপডেট করতে পারবেন।
                          </p>
                        </div>

                        <form onSubmit={handleSavePinAndOpenDashboard} className="flex gap-2">
                          <input
                            type="password"
                            inputMode="numeric"
                            maxLength={6}
                            value={pinCode}
                            onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ""))}
                            placeholder="৪-ডিজিট পিন"
                            className="flex-1 px-3 py-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-center text-sm font-black tracking-[0.25em] font-mono tabular-nums text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                          />
                          <button
                            type="submit"
                            disabled={isProcessingAuth || pinCode.length < 4}
                            className="px-4 py-2.5 bg-emerald-600 text-white rounded-xl font-black text-xs disabled:opacity-50 shrink-0 cursor-pointer"
                          >
                            সেভ করুন
                          </button>
                          <button
                            type="button"
                            onClick={handleSkipPinToDashboard}
                            className="px-3 py-2.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-xs shrink-0 cursor-pointer"
                          >
                            স্কিপ
                          </button>
                        </form>
                      </div>
                    )}

                    {/* VIEW 4: MINIMALIST PIN LOGIN (NO OTP NEEDED) */}
                    {subView === "pin_login" && (
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                            <Lock size={13} className="text-emerald-600" />
                            পিন দিয়ে লগইন (OTP ছাড়া)
                          </span>
                          <button
                            type="button"
                            onClick={() => setSubView("otp_verify")}
                            className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                          >
                            পিন ভুলে গেছেন? OTP পাঠান
                          </button>
                        </div>

                        <form onSubmit={handlePinLogin} className="flex gap-2">
                          <input
                            type="password"
                            inputMode="numeric"
                            maxLength={6}
                            value={pinCode}
                            onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ""))}
                            placeholder="আপনার ৪-ডিজিট পিন"
                            className="flex-1 px-3 py-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-center text-sm font-black tracking-[0.25em] font-mono tabular-nums text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                          />
                          <button
                            type="submit"
                            disabled={isProcessingAuth || pinCode.length < 4}
                            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs disabled:opacity-50 shrink-0 cursor-pointer"
                          >
                            লগইন
                          </button>
                        </form>
                      </div>
                    )}

                    {/* VIEW 5: MINIMALIST TEACHER UPDATE DASHBOARD */}
                    {subView === "dashboard" && (
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3.5">
                        {isLoadingProfile ? (
                          <div className="py-6 flex items-center justify-center gap-2 text-slate-500">
                            <Loader2 size={18} className="animate-spin text-emerald-600" />
                            <span className="text-xs font-bold">লোড হচ্ছে...</span>
                          </div>
                        ) : fullTeacherProfile ? (
                          <>
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-slate-800 overflow-hidden shrink-0 flex items-center justify-center">
                                  {fullTeacherProfile.photoUrl ? (
                                    <img
                                      src={fullTeacherProfile.photoUrl}
                                      alt={fullTeacherProfile.name}
                                      className="w-full h-full object-cover"
                                      referrerPolicy="no-referrer"
                                    />
                                  ) : (
                                    <span className="text-emerald-600 font-black text-sm">
                                      {fullTeacherProfile.name.charAt(0)}
                                    </span>
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <h5 className="font-black text-slate-900 dark:text-white text-sm truncate">
                                    {fullTeacherProfile.name}
                                  </h5>
                                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                    {fullTeacherProfile.collegeName}
                                    {fullTeacherProfile.education?.honours?.subject
                                      ? ` · ${fullTeacherProfile.education.honours.subject}`
                                      : ""}
                                  </p>
                                </div>
                              </div>

                              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                                ভেরিফাইড সেশন
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={handleOpenCvEditor}
                              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
                            >
                              <FileEdit size={15} />
                              <span>সিভি এডিট ও আপডেট করুন</span>
                            </button>

                            <div className="pt-2 border-t border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between text-[11px] text-slate-500">
                              <button
                                type="button"
                                onClick={() => {
                                  setPinCode("");
                                  setSubView("set_pin");
                                }}
                                className="font-bold hover:text-slate-800 dark:hover:text-white cursor-pointer"
                              >
                                {authRecord?.pinHash ? "পিন পরিবর্তন করুন" : "৪-ডিজিট পিন সেট করুন"}
                              </button>
                              <button
                                type="button"
                                onClick={handleLogoutDashboard}
                                className="font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1 cursor-pointer"
                              >
                                <LogOut size={12} /> লগআউট
                              </button>
                            </div>
                          </>
                        ) : null}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="p-5 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 space-y-3">
                    <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                      <span className="font-mono tabular-nums">{phone}</span> নম্বরে কোনো সিভি পাওয়া যায়নি।
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenNewTeacherModal();
                      }}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <GraduationCap size={14} />
                      নতুন সিভি জমা দিন
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
