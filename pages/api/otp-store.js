// In-memory OTP store (for demo: resets on server restart)
const otpStore = {};

/**
 * POST /api/otp-store
 * {
 *   action: "store" | "verify",
 *   email: "user@example.com",
 *   otp: "123456"
 * }
 */
export default function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  const { action, email, otp } = req.body;

  if (!action || !email || !otp) {
    return res.status(400).json({ message: "Missing fields: action, email, otp are required." });
  }

  if (action === "store") {
    otpStore[email] = { otp, createdAt: Date.now() };
    return res.status(200).json({ message: "OTP stored." });
  }

  if (action === "verify") {
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

  return res.status(400).json({ message: "Invalid action. Use 'store' or 'verify'." });
}
