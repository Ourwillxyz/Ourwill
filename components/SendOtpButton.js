import React, { useState } from "react";

export default function SendOtpButton() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [otp, setOtp] = useState("");

  // Function to generate a 6-digit OTP
  function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async function handleSendOtp(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    // Generate OTP
    const otpValue = generateOtp();
    setOtp(otpValue);

    // Send POST request to backend API
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
    <form onSubmit={handleSendOtp} style={{ maxWidth: 350, margin: "auto" }}>
      <label style={{ display: "block", margin: "1em 0 0.5em" }}>
        Email address:
        <input
          type="email"
          value={email}
          required
          onChange={e => setEmail(e.target.value)}
          placeholder="Enter your email"
          style={{ width: "100%", padding: "0.5em", marginTop: "0.3em" }}
        />
      </label>
      <button
        type="submit"
        disabled={loading || !email}
        style={{
          marginTop: "1em",
          padding: "0.5em 1.5em",
          background: "#0070f3",
          color: "#fff",
          border: "none",
          borderRadius: 4,
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Sending..." : "Send OTP"}
      </button>
      {message && (
        <div style={{ marginTop: "1em", color: message.includes("OTP sent") ? "green" : "red" }}>
          {message}
        </div>
      )}
      {/* For demo only: show generated OTP (remove in production!) */}
      {otp && (
        <div style={{ marginTop: "1em", color: "#333", fontSize: "0.95em" }}>
          <strong>Generated OTP (for demo):</strong> {otp}
        </div>
      )}
    </form>
  );
}
