// This must match your otp store implementation!
const otpStore = require('./otp-store').otpStore || {};

/**
 * POST /api/verify
 * {
 *   email: "user@example.com",
 *   otp: "123456"
 * }
 */
export default function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: "Missing fields: email and otp are required." });
  }

  const record = otpStore[email];
  if (!record) {
    return res.status(400).json({ message: "No OTP found for this email." });
  }
  // Expiry check (optional, e.g., 5 mins = 300000 ms)
  const expired = Date.now() - record.createdAt > 300000;
  if (expired) {
    delete otpStore[email];
    return res.status(400).json({ message: "OTP expired." });
  }
  if (record.otp === otp) {
    delete otpStore[email]; // Invalidate after use
    return res.status(200).json({ message: "OTP verified." });
  } else {
    return res.status(400).json({ message: "OTP incorrect." });
  }
}
