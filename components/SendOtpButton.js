import React, { useState } from "react";

export default function SendOtpButton() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Generate a random 6-digit OTP for demo (you can change logic as needed)
  function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async function handleSendOtp(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    const otpValue = generateOtp();
    setOtp(otpValue);

    try {
      const res = await fetch("/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otpValue }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("OTP sent to your email!");
      } else {
        setMessage(data.message || "Failed to send OTP.");
      }
    } catch (error) {
      setMessage("Network error. Please try again.");
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSendOtp}>
      <label>
        Email:
        <input
          type="email"
          value={email}
          required
          onChange={e => setEmail(e.target.value)}
          placeholder="Enter your email"
        />
      </label>
      <button type="submit" disabled={loading}>
        {loading ? "Sending..." : "Send OTP"}
      </button>
      {message && <div>{message}</div>}
      {otp && <div>Your OTP (for demo): {otp}</div>}
    </form>
  );
}
