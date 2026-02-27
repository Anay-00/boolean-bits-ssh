/* ================================================
   AI Powered Public Grievance Classifier
   Node.js/Express Backend – flio OTP
   ================================================ */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5500;

/* ── Twilio Setup (lazy — only created when credentials are valid) ── */
const twilio = require('twilio');
let twilioClient = null;

function getTwilioClient() {
  if (twilioClient) return twilioClient;

  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;

  if (!sid || !token || sid.startsWith('your_') || token.startsWith('your_')) {
    return null;
  }

  twilioClient = twilio(sid, token);
  return twilioClient;
}

/* ── Middleware ── */
app.use(cors());
app.use(express.json());

/* ── Serve Static Files ── */
app.use('/static', express.static(path.join(__dirname, 'static')));

/* ── Page Routes (must come BEFORE root static middleware) ── */
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/home', (req, res) => {
  res.sendFile(path.join(__dirname, 'home.html'));
});

app.get('/complaint', (req, res) => {
  res.sendFile(path.join(__dirname, 'complaint.html'));
});

app.get('/seed', (req, res) => {
  res.sendFile(path.join(__dirname, 'seed.html'));
});

/* ── Serve root-level files (home.html, home.css, home.js, complaint.css, etc.) ── */
app.use(express.static(__dirname, {
  extensions: ['html', 'css', 'js'],
  index: false
}));

/* ── In-Memory OTP Store ── */
// Format: { "+91XXXXXXXXXX": { otp: "123456", expiresAt: Date } }
const otpStore = new Map();
const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

function normalizeIndianPhone(value) {
  const raw = String(value || '').trim();
  if (/^\+91\d{10}$/.test(raw)) return raw;
  const digits = raw.replace(/\D/g, '');
  if (/^91\d{10}$/.test(digits)) return `+${digits}`;
  if (/^\d{10}$/.test(digits)) return `+91${digits}`;
  return null;
}

function normalizeOtp(value) {
  return String(value || '').replace(/\D/g, '').trim();
}

/* ── Helper: Generate 6-digit OTP ── */
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/* ── Helper: Cleanup expired OTPs ── */
function cleanupExpired() {
  const now = Date.now();
  for (const [phone, data] of otpStore) {
    if (now > data.expiresAt) {
      otpStore.delete(phone);
    }
  }
}

// Cleanup every 2 minutes
setInterval(cleanupExpired, 2 * 60 * 1000);

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   POST /send-otp
   Body: { "phone": "+91XXXXXXXXXX" }
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
app.post('/send-otp', async (req, res) => {
  const normalizedPhone = normalizeIndianPhone(req.body?.phone);

  if (!normalizedPhone) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid phone number. Provide a valid Indian number.'
    });
  }

  const otp = generateOTP();

  const client = getTwilioClient();
  if (!client) {
    // Still store OTP so verify works — useful for testing without real Twilio
    otpStore.set(phone, {
      otp,
      expiresAt: Date.now() + OTP_EXPIRY_MS
    });
    console.log(`⚠️  Twilio not configured. OTP for ${normalizedPhone}: ${otp}`);
    return res.json({
      status: 'success',
      message: 'OTP generated (Twilio not configured — check server console for OTP)'
    });
  }

  try {
    await client.messages.create({
      body: `Your AI Grievance Portal OTP is: ${otp}. Valid for 5 minutes. Do not share this code.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: normalizedPhone
    });

    // Store OTP with expiry
    otpStore.set(normalizedPhone, {
      otp,
      expiresAt: Date.now() + OTP_EXPIRY_MS
    });

    console.log(`✅ OTP sent to ${normalizedPhone}`);

    res.json({
      status: 'success',
      message: 'OTP sent successfully'
    });
  } catch (err) {
    console.error('❌ Twilio error:', err.message);
    res.status(500).json({
      status: 'error',
      message: 'Failed to send OTP. Please try again.'
    });
  }
});

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   POST /verify-otp
   Body: { "phone": "+91XXXXXXXXXX", "otp": "123456" }
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
app.post('/verify-otp', (req, res) => {
  const normalizedPhone = normalizeIndianPhone(req.body?.phone);
  const normalizedOtp = normalizeOtp(req.body?.otp);

  if (!normalizedPhone || !normalizedOtp) {
    return res.status(400).json({
      status: 'error',
      message: 'Phone and OTP are required.'
    });
  }

  const stored = otpStore.get(normalizedPhone);

  if (!stored) {
    return res.status(400).json({
      status: 'error',
      message: 'No OTP found for this number. Please request a new one.'
    });
  }

  if (Date.now() > stored.expiresAt) {
    otpStore.delete(normalizedPhone);
    return res.status(400).json({
      status: 'error',
      message: 'OTP has expired. Please request a new one.'
    });
  }

  if (normalizeOtp(stored.otp) !== normalizedOtp) {
    return res.status(400).json({
      status: 'error',
      message: 'Incorrect OTP. Please try again.'
    });
  }

  // OTP verified — remove from store
  otpStore.delete(normalizedPhone);

  console.log(`✅ OTP verified for ${normalizedPhone}`);

  res.json({
    status: 'success',
    message: 'OTP verified successfully'
  });
});

/* ── Start Server ── */
app.listen(PORT, () => {
  console.log(`\n🚀 Server running at http://localhost:${PORT}`);
  console.log(`📱 Twilio OTP endpoints ready\n`);
});
