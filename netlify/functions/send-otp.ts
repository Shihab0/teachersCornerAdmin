const ALLOWED_SMS_HOSTS = new Set(["bulksmsbd.net", "www.bulksmsbd.net"]);
const DEFAULT_SMS_API_URL = "http://bulksmsbd.net/api/smsapi";

function resolveSafeSmsUrl(rawUrl?: string): URL {
  if (rawUrl) {
    try {
      const parsed = new URL(rawUrl.trim());
      if (
        (parsed.protocol === "http:" || parsed.protocol === "https:") &&
        ALLOWED_SMS_HOSTS.has(parsed.hostname.toLowerCase())
      ) {
        return parsed;
      }
    } catch {
      // Fall back to default URL
    }
  }
  return new URL(DEFAULT_SMS_API_URL);
}

function jsonResponse(payload: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export default async (req: Request): Promise<Response> => {
  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const body = (await req.json().catch(() => ({}))) as {
      phone?: unknown;
      otp?: unknown;
    };

    const rawPhone = typeof body.phone === "string" ? body.phone : "";
    const rawOtp = typeof body.otp === "string" ? body.otp.trim() : "";

    if (!rawPhone || !rawOtp) {
      return jsonResponse({ error: "মোবাইল নম্বর এবং ওটিপি আবশ্যক।" }, 400);
    }

    const digitsOnly = rawPhone.replace(/\D/g, "");
    const localPhone = digitsOnly.startsWith("880")
      ? digitsOnly.slice(2)
      : digitsOnly;

    if (!/^01[3-9]\d{8}$/.test(localPhone)) {
      return jsonResponse(
        { error: "সঠিক ১১-ডিজিটের বাংলাদেশি মোবাইল নম্বর দিন।" },
        400
      );
    }

    if (!/^\d{4,6}$/.test(rawOtp)) {
      return jsonResponse(
        { error: "সঠিক ৪-ডিজিটের ওটিপি কোড প্রয়োজন।" },
        400
      );
    }

    const apiKey = (process.env.SMS_API_KEY || "").trim();
    const senderId = (process.env.SMS_SENDER_ID || "").trim();

    if (!apiKey || !senderId) {
      return jsonResponse({
        success: true,
        mode: "sandbox",
        demoOtp: rawOtp,
        gatewayNotice:
          "লাইভ SMS পাঠাতে Netlify Environment Variables-এ SMS_API_KEY এবং SMS_SENDER_ID সেট করুন।",
        message: `OTP কোড প্রস্তুত হয়েছে (${rawOtp})`,
      });
    }

    const intlPhone = `88${localPhone}`;
    const smsMessage = `Your Teachers Corner OTP is ${rawOtp}`;

    const url = resolveSafeSmsUrl(process.env.SMS_API_URL);
    url.searchParams.set("api_key", apiKey);
    url.searchParams.set("type", "text");
    url.searchParams.set("number", intlPhone);
    url.searchParams.set("senderid", senderId);
    url.searchParams.set("message", smsMessage);

    const gatewayRes = await fetch(url.toString(), { method: "GET" });
    const gatewayText = await gatewayRes.text();

    let gatewayCode = 0;
    let gatewayNote = "";
    try {
      const parsed = JSON.parse(gatewayText);
      gatewayCode = Number(parsed.response_code || 0);
      gatewayNote = String(parsed.error_message || "");
    } catch {
      // Non-JSON response
    }

    if (gatewayCode === 202 || gatewayCode === 200) {
      return jsonResponse({
        success: true,
        mode: "live",
        message: `${localPhone} নম্বরে ৪-ডিজিটের OTP পাঠানো হয়েছে।`,
      });
    }

    const ipMatch = gatewayNote.match(/\b(?:\d{1,3}\.){3}\d{1,3}\b/);
    const serverIp = ipMatch ? ipMatch[0] : "";
    const gatewayNotice =
      gatewayCode === 1032
        ? `BulkSMSBD প্যানেলে সার্ভার IP${serverIp ? ` (${serverIp})` : ""} Whitelist করা নেই। bulksmsbd.net-এর Phonebook → IP White List থেকে Source IP Checking Disable করলে সরাসরি ফোনে SMS যাবে।`
        : gatewayNote
          ? `BulkSMSBD কোড (${gatewayCode}): ${gatewayNote}`
          : "SMS গেটওয়ে রেসপন্স পাওয়া যায়নি।";

    return jsonResponse({
      success: true,
      mode: "sandbox",
      demoOtp: rawOtp,
      gatewayNotice,
      serverIp: serverIp || undefined,
      message: `OTP কোড প্রস্তুত হয়েছে (${rawOtp})`,
    });
  } catch {
    return jsonResponse(
      { error: "ওটিপি পাঠাতে সার্ভার ত্রুটি হয়েছে। আবার চেষ্টা করুন।" },
      500
    );
  }
};
