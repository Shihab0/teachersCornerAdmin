import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv, Plugin} from 'vite';

const ALLOWED_SMS_HOSTS = new Set(['bulksmsbd.net', 'www.bulksmsbd.net']);
const DEFAULT_SMS_API_URL = 'http://bulksmsbd.net/api/smsapi';

function resolveSafeSmsUrl(rawUrl?: string): URL {
  if (rawUrl) {
    try {
      const parsed = new URL(rawUrl.trim());
      if (
        (parsed.protocol === 'http:' || parsed.protocol === 'https:') &&
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

function bulkSmsOtpPlugin(env: Record<string, string>): Plugin {
  return {
    name: 'bulksms-otp-api-middleware',
    configureServer(server) {
      server.middlewares.use('/api/otp/send', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({error: 'Method not allowed'}));
          return;
        }

        let body = '';
        req.on('data', (chunk) => {
          body += chunk.toString();
        });

        req.on('end', async () => {
          try {
            const parsedBody = JSON.parse(body || '{}');
            const {phone, otp} = parsedBody as {phone?: unknown; otp?: unknown};

            const rawPhone = typeof phone === 'string' ? phone : '';
            const rawOtp = typeof otp === 'string' ? otp.trim() : '';

            if (!rawPhone || !rawOtp) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({error: 'মোবাইল নম্বর এবং ওটিপি আবশ্যক।'}));
              return;
            }

            const digitsOnly = rawPhone.replace(/\D/g, '');
            const localPhone = digitsOnly.startsWith('880')
              ? digitsOnly.slice(2)
              : digitsOnly;

            if (!/^01[3-9]\d{8}$/.test(localPhone)) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(
                JSON.stringify({
                  error: 'সঠিক ১১-ডিজিটের বাংলাদেশি মোবাইল নম্বর দিন।',
                })
              );
              return;
            }

            if (!/^\d{4,6}$/.test(rawOtp)) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(
                JSON.stringify({
                  error: 'সঠিক ৪-ডিজিটের ওটিপি কোড প্রয়োজন।',
                })
              );
              return;
            }

            const apiKey = (
              process.env.SMS_API_KEY ||
              env.SMS_API_KEY ||
              ''
            ).trim();
            const senderId = (
              process.env.SMS_SENDER_ID ||
              env.SMS_SENDER_ID ||
              ''
            ).trim();

            if (!apiKey || !senderId) {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(
                JSON.stringify({
                  success: true,
                  mode: 'sandbox',
                  demoOtp: rawOtp,
                  gatewayNotice:
                    'লাইভ SMS পাঠাতে Settings → Secrets-এ SMS_API_KEY এবং SMS_SENDER_ID সেট করুন।',
                  message: `OTP কোড প্রস্তুত হয়েছে (${rawOtp})`,
                })
              );
              return;
            }

            const intlPhone = `88${localPhone}`;
            // Strict BulkSMSBD required format: (Your {Brand/Company Name} OTP is XXXX)
            const smsMessage = `Your Teachers Corner OTP is ${rawOtp}`;

            const url = resolveSafeSmsUrl(
              process.env.SMS_API_URL || env.SMS_API_URL
            );
            url.searchParams.set('api_key', apiKey);
            url.searchParams.set('type', 'text');
            url.searchParams.set('number', intlPhone);
            url.searchParams.set('senderid', senderId);
            url.searchParams.set('message', smsMessage);

            const gatewayRes = await fetch(url.toString(), {method: 'GET'});
            const gatewayText = await gatewayRes.text();

            let gatewayCode = 0;
            let gatewayNote = '';
            try {
              const parsed = JSON.parse(gatewayText);
              gatewayCode = Number(parsed.response_code || 0);
              gatewayNote = String(parsed.error_message || '');
            } catch {
              // Non-JSON response
            }

            // BulkSMSBD returns response_code: 202 for "SMS Submitted Successfully"
            if (gatewayCode === 202 || gatewayCode === 200) {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(
                JSON.stringify({
                  success: true,
                  mode: 'live',
                  message: `${localPhone} নম্বরে ৪-ডিজিটের OTP পাঠানো হয়েছে।`,
                })
              );
              return;
            }

            const ipMatch = gatewayNote.match(/\b(?:\d{1,3}\.){3}\d{1,3}\b/);
            const serverIp = ipMatch ? ipMatch[0] : '';
            const gatewayNotice =
              gatewayCode === 1032
                ? `BulkSMSBD প্যানেলে সার্ভার IP${serverIp ? ` (${serverIp})` : ''} Whitelist করা নেই। bulksmsbd.net-এর Phonebook → IP White List থেকে Source IP Checking Disable করলে সরাসরি ফোনে SMS যাবে।`
                : gatewayNote
                  ? `BulkSMSBD কোড (${gatewayCode}): ${gatewayNote}`
                  : 'SMS গেটওয়ে রেসপন্স পাওয়া যায়নি।';

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(
              JSON.stringify({
                success: true,
                mode: 'sandbox',
                demoOtp: rawOtp,
                gatewayNotice,
                serverIp: serverIp || undefined,
                message: `OTP কোড প্রস্তুত হয়েছে (${rawOtp})`,
              })
            );
          } catch {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(
              JSON.stringify({
                error: 'ওটিপি পাঠাতে সার্ভার ত্রুটি হয়েছে। আবার চেষ্টা করুন।',
              })
            );
          }
        });
      });
    },
  };
}

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss(), bulkSmsOtpPlugin(env)],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
