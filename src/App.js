import React, { useState } from "react";

export default function App() {
  const [step, setStep] = useState(1);
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendOtp(e) {
    e.preventDefault();
    setMessage("");
    setLoading(true);
    try {
      const response = await fetch("https://your-backend.com/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile })
      });
      if (!response.ok) throw new Error("Failed to send OTP");
      setMessage("OTP sent! Please check your phone.");
      setStep(2);
    } catch (err) {
      setMessage(err.message);
    }
    setLoading(false);
  }

  async function verifyOtp(e) {
    e.preventDefault();
    setMessage("");
    setLoading(true);
    try {
      const response = await fetch("https://your-backend.com/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile, otp })
      });
      if (!response.ok) throw new Error("OTP verification failed");
      setMessage("Registration successful!");
      setStep(1);
      setMobile("");
      setOtp("");
    } catch (err) {
      setMessage(err.message);
    }
    setLoading(false);
  }

  return (
    <main style={{ maxWidth: 400, margin: "2em auto", padding: 20, border: "1px solid #ccc", borderRadius: 8 }}>
      <h2>User Registration (with OTP)</h2>
      {step === 1 && (
        <form onSubmit={sendOtp}>
          <div>
            <input
              type="tel"
              placeholder="Enter mobile number"
              value={mobile}
              onChange={e => setMobile(e.target.value)}
              pattern="^\+?\d{10,15}$"
              required
              style={{ width: "100%", marginBottom: 10, padding: 8 }}
            />
          </div>
          <button type="submit" disabled={loading} style={{ width: "100%", padding: 10 }}>
            {loading ? "Sending..." : "Send OTP"}
          </button>
        </form>
      )}
      {step === 2 && (
        <form onSubmit={verifyOtp}>
          <div>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={e => setOtp(e.target.value)}
              required
              style={{ width: "100%", marginBottom: 10, padding: 8 }}
            />
          </div>
          <button type="submit" disabled={loading} style={{ width: "100%", padding: 10 }}>
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>
      )}
      {message && <div style={{ marginTop: 10, color: message.includes("successful") ? "green" : "blue" }}>{message}</div>}
    </main>
  );
}
