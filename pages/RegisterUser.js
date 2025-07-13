// pages/RegisterUser.js
import { useState } from 'react';

export default function RegisterUser() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [info, setInfo] = useState('');
  const [step, setStep] = useState(1);
  const [enteredOtp, setEnteredOtp] = useState('');

  const generateOtp = () => Math.floor(1000 + Math.random() * 9000).toString();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    const newOtp = generateOtp();
    setOtp(newOtp);
    setInfo('Sending OTP...');

    try {
      const res = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: newOtp }),
      });

      const data = await res.json();
      if (data.success) {
        setStep(2);
        setInfo('✅ OTP sent to your email.');
      } else {
        setInfo(`❌ Failed to send OTP: ${data.message}`);
      }
    } catch (error) {
      console.error('Error:', error);
      setInfo('❌ Error sending OTP.');
    }
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (enteredOtp === otp) {
      setInfo('✅ OTP verified successfully!');
    } else {
      setInfo('❌ Incorrect OTP.');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '2rem auto', padding: '1rem', border: '1px solid #ccc', borderRadius: 8 }}>
      <h2>Email OTP Test</h2>

      {step === 1 && (
        <form onSubmit={handleSendOtp}>
          <label>Email Address:<br />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: 8 }}
              placeholder="e.g. user@example.com"
            />
          </label>
          <br /><br />
          <button type="submit" style={{ padding: '8px 16px' }}>Send OTP</button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleVerifyOtp}>
          <label>Enter OTP:<br />
            <input
              type="text"
              value={enteredOtp}
              onChange={(e) => setEnteredOtp(e.target.value)}
              maxLength={4}
              required
              style={{ width: '100%', padding: 8 }}
            />
          </label>
          <br /><br />
          <button type="submit" style={{ padding: '8px 16px' }}>Verify OTP</button>
        </form>
      )}

      {info && (
        <div style={{ marginTop: '1rem', color: info.startsWith('✅') ? 'green' : 'red' }}>
          {info}
        </div>
      )}
    </div>
  );
}
