import React, { useState } from "react";

const OtpEntryForm = ({ email, onVerified }) => {
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    // Call your verify endpoint
    const res = await fetch("/api/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });
    const data = await res.json();
    if (res.ok) {
      setMessage("OTP verified!");
      if (onVerified) onVerified();
    } else {
      setMessage(data.message || "Verification failed.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Enter OTP:
        <input
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
        />
      </label>
      <button type="submit">Verify OTP</button>
      {message && <div>{message}</div>}
    </form>
  );
};

export default OtpEntryForm;
