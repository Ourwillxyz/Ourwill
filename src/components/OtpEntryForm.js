import React, { useState } from 'react';

function OtpEntryForm({ mobile, onSuccess }) {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, otp })
      });
      const result = await response.json();
      if (result.success) {
        setMessage('✅ OTP verified! Registration complete.');
        if (onSuccess) onSuccess();
      } else {
        setMessage(result.error || '❌ Invalid OTP. Please try again.');
      }
    } catch (err) {
      setMessage('❌ Error verifying OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Enter OTP</h2>
      <p>Please enter the OTP sent to your email.</p>
      <input
        type="text"
        maxLength={4}
        value={otp}
        onChange={e => setOtp(e.target.value)}
        placeholder="4-digit OTP"
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Verifying...' : 'Verify OTP'}
      </button>
      {message && <div style={{ marginTop: '1em' }}>{message}</div>}
    </form>
  );
}

export default OtpEntryForm;
