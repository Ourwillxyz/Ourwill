import React, { useState } from 'react';
import { useRouter } from 'next/router';

export default function OTPVerification() {
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [userOtp, setUserOtp] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const sendOTP = () => {
    if (!phone.match(/^\d{10,15}$/)) {
      setError("Please enter a valid phone number.");
      return;
    }
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(otp);
    setOtpSent(true);
    setError('');
  };

  const verifyOTP = () => {
    if (userOtp === generatedOtp) {
      // Redirect to Presidential Poll
      router.push('/presidential');
    } else {
      setError("Incorrect OTP. Please try again.");
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>OTP Verification</h2>
      <p>This is a simulated OTP flow. In production, OTPs will be sent via SMS.</p>

      <label>Enter Phone Number:</label><br />
      <input
        type="text"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="e.g. 07xxxxxxxx or 2547xxxxxxx"
      />
      <br /><br />

      {!otpSent && (
        <button onClick={sendOTP}>Send OTP</button>
      )}

      {otpSent && (
        <>
          <p><strong>Simulated OTP:</strong> {generatedOtp}</p>
          <label>Enter OTP:</label><br />
          <input
            type="text"
            value={userOtp}
            onChange={(e) => setUserOtp(e.target.value)}
            placeholder="Enter OTP sent"
          />
          <br /><br />
          <button onClick={verifyOTP}>Verify OTP & Proceed</button>
        </>
      )}

      {error && (
        <p style={{ color: 'red' }}>{error}</p>
      )}
    </div>
  );
}
