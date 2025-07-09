import React, { useState } from 'react';
import { sendEmailOtp } from './helpers/sendEmailOtp'; // New helper for email OTP

function generateOtp() {
  return Math.floor(1000 + Math.random() * 9000).toString(); // 4-digit OTP
}

const RegisterUser = () => {
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [inputOtp, setInputOtp] = useState('');
  const [step, setStep] = useState(1);
  const [info, setInfo] = useState('');
  const [verified, setVerified] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!mobile.startsWith('2547') || mobile.length !== 12) {
      setInfo('Please enter a valid Kenyan mobile number, e.g. 2547XXXXXXXXX.');
      return;
    }

    // Simple email validation
    if (!/\S+@\S+\.\S+/.test(email)) {
      setInfo('Please enter a valid email address.');
      return;
    }

    const otp = generateOtp();
    setGeneratedOtp(otp);
    setInfo('Sending OTP to your email...');

    const result = await sendEmailOtp(email, otp);
    if (result.success) {
      setStep(2);
      setInfo('OTP sent! Please check your email.');
    } else {
      setInfo('Failed to send OTP email. Please try again later.');
    }
  };

  const handleVerify = (e) => {
    e.preventDefault();
    if (inputOtp === generatedOtp) {
      setVerified(true);
      setInfo('✅ Registration successful! Your email has been verified.');
    } else {
      setInfo('❌ Incorrect OTP. Please try again.');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '2rem auto', fontSize: '1.2rem', textAlign: 'center', border: '1px solid #eee', borderRadius: 8, padding: 24 }}>
      <h2>User Registration</h2>

      {step === 1 && (
        <form onSubmit={handleRegister}>
          <label>
            Mobile Number:<br />
            <input
              type="text"
              value={mobile}
              onChange={e => setMobile(e.target.value)}
              placeholder="e.g. 2547XXXXXXXXX"
              required
              style={{ padding: 8, width: '90%', margin: '1rem 0' }}
              disabled={step !== 1}
            />
          </label>
          <br />
          <label>
            Email Address:<br />
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="e.g. user@example.com"
              required
              style={{ padding: 8, width: '90%', margin: '1rem 0' }}
              disabled={step !== 1}
            />
          </label>
          <br />
          <button type="submit" disabled={step !== 1} style={{ padding: '8px 16px' }}>Register</button>
        </form>
      )}

      {step === 2 && !verified && (
        <form onSubmit={handleVerify}>
          <label>
            Enter OTP sent to your email:<br />
            <input
              type="text"
              value={inputOtp}
              onChange={e => setInputOtp(e.target.value)}
              required
              style={{ padding: 8, width: '90%', margin: '1rem 0' }}
              maxLength={4}
            />
          </label>
          <br />
          <button type="submit" style={{ padding: '8px 16px' }}>Verify OTP</button>
        </form>
      )}

      {verified && (
        <div style={{ color: 'green', margin: '1rem 0' }}>
          🎉 Registration complete!
        </div>
      )}

      {info && (
        <div style={{ marginTop: 16, color: info.startsWith('✅') ? 'green' : (info.startsWith('❌') ? 'red' : '#333') }}>
          {info}
        </div>
      )}
    </div>
  );
};

export default RegisterUser;
