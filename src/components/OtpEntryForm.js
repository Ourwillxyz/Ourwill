// src/components/OtpEntryForm.js
import { useState } from 'react';

const OtpEntryForm = ({ onVerify }) => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    if (otp.length !== 4) {
      setError('OTP must be 4 digits');
      return;
    }

    setError('');
    onVerify(otp);
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Enter OTP:
        <input
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          maxLength={4}
          required
        />
      </label>
      <br />
      <button type="submit">Verify</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  );
};

export default OtpEntryForm;
