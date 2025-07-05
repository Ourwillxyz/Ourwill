import { useState } from 'react';
import { useRouter } from 'next/router';

export default function OTP() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate OTP Verification
    if (otp === '123456') {
      setIsVerified(true);
      setTimeout(() => router.push('/presidential'), 1000);
    } else {
      alert('Invalid OTP. Try 123456 for demo.');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>🇳🇬 Nigeria - Phone Verification</h2>
      {!isVerified ? (
        <form onSubmit={handleSubmit}>
          <input
            type="tel"
            placeholder="Enter phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          /><br /><br />
          <input
            type="text"
            placeholder="Enter OTP (Use 123456)"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          /><br /><br />
          <button type="submit">Verify & Proceed</button>
        </form>
      ) : (
        <p>✅ Verified! Redirecting to poll...</p>
      )}
    </div>
  );
}
