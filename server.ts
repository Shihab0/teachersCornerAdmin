import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

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

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // BulkSMSBD OTP Dispatch Endpoint
  app.post("/api/otp/send", async (req, res) => {
    try {
      const { phone, otp } = req.body as { phone?: unknown; otp?: unknown };
      const rawPhone = typeof phone === "string" ? phone : "";
      const rawOtp = typeof otp === "string" ? otp.trim() : "";

      if (!rawPhone || !rawOtp) {
        res.status(400).json({ error: "মোবাইল নম্বর এবং ওটিপি আবশ্যক।" });
        return;
      }

      // Normalize Bangladeshi phone number (01XXXXXXXXX -> 8801XXXXXXXXX)
      const digitsOnly = rawPhone.replace(/\D/g, "");
      const localPhone = digitsOnly.startsWith("880")
        ? digitsOnly.slice(2)
        : digitsOnly;

      if (!/^01[3-9]\d{8}$/.test(localPhone)) {
        res.status(400).json({ error: "সঠিক ১১-ডিজিটের বাংলাদেশি মোবাইল নম্বর দিন।" });
        return;
      }

      if (!/^\d{4,6}$/.test(rawOtp)) {
        res.status(400).json({ error: "সঠিক ৪-ডিজিটের ওটিপি কোড প্রয়োজন।" });
        return;
      }

      const apiKey = (process.env.SMS_API_KEY || "").trim();
      const senderId = (process.env.SMS_SENDER_ID || "").trim();

      if (!apiKey || !senderId) {
        res.json({
          success: true,
          mode: "sandbox",
          demoOtp: rawOtp,
          gatewayNotice:
            "লাইভ SMS পাঠাতে Settings → Secrets-এ SMS_API_KEY এবং SMS_SENDER_ID সেট করুন।",
          message: `OTP কোড প্রস্তুত হয়েছে (${rawOtp})`,
        });
        return;
      }

      const intlPhone = `88${localPhone}`;
      // Strict BulkSMSBD required format: (Your {Brand/Company Name} OTP is XXXX)
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
        res.json({
          success: true,
          mode: "live",
          message: `${localPhone} নম্বরে ৪-ডিজিটের OTP পাঠানো হয়েছে।`,
        });
        return;
      }

      const ipMatch = gatewayNote.match(/\b(?:\d{1,3}\.){3}\d{1,3}\b/);
      const serverIp = ipMatch ? ipMatch[0] : "";
      const gatewayNotice =
        gatewayCode === 1032
          ? `BulkSMSBD প্যানেলে সার্ভার IP${serverIp ? ` (${serverIp})` : ""} Whitelist করা নেই। bulksmsbd.net-এর Phonebook → IP White List থেকে Source IP Checking Disable করলে সরাসরি ফোনে SMS যাবে।`
          : gatewayNote
            ? `BulkSMSBD কোড (${gatewayCode}): ${gatewayNote}`
            : "SMS গেটওয়ে রেসপন্স পাওয়া যায়নি।";

      res.json({
        success: true,
        mode: "sandbox",
        demoOtp: rawOtp,
        gatewayNotice,
        serverIp: serverIp || undefined,
        message: `OTP কোড প্রস্তুত হয়েছে (${rawOtp})`,
      });
    } catch {
      res.status(500).json({
        error: "ওটিপি পাঠাতে সার্ভার ত্রুটি হয়েছে। আবার চেষ্টা করুন।",
      });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
