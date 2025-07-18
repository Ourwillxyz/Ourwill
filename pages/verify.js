import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { supabase } from '../src/supabaseClient';
import emailjs from '@emailjs/browser';

export default function Verify() {
  const router = useRouter();
  const { email, mobile } = router.query;

  const [otpInput, setOtpInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Redirect if email is missing
  useEffect(() => {
    if (!email) {
      router.replace('/RegisterUser');
    }
  }, [email, router]);

  // Handle resend timer
  useEffect(() => {
    if (resendTimer > 0 && !canResend) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else if (resendTimer === 0) {
      setCanResend(true);
    }
  }, [resendTimer, canResend]);

  // Simulate fetching the OTP sent to the user (in real app, never expose OTP client-side)
  // For demo, we check the last OTP sent stored in Supabase for this email
  async function verifyOtp() {
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    // Simulate: fetch the pending voter entry by email
    const { data, error } = await supabase
      .from('voter')
      .select('otp, status')
      .eq('email', email)
      .eq('status', 'pending')
      .single();

    if (error || !data) {
      setErrorMsg('Could not verify OTP. Please try registering again.');
      setLoading(false);
      return;
    }

    if (data.otp !== otpInput) {
      setErrorMsg('Incorrect OTP. Please check and try again.');
      setLoading(false);
      return;
    }

    // Mark user as verified
    const { error: updateError } = await supabase
      .from('voter')
      .update({ status: 'verified' })
      .eq('email', email);

    if (updateError) {
      setErrorMsg('Verification failed. Please try again.');
      setLoading(false);
      return;
    }

    setSuccessMsg('OTP verified! Your registration is complete.');
    setLoading(false);

    // Redirect after short delay
    setTimeout(() => {
      router.replace('/'); // or dashboard, etc.
    }, 2000);
  }

  // Resend OTP logic
  async function handleResendOtp() {
    if (!canResend) return;
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    // Generate new OTP
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();

    // Update OTP in DB
    const { error } = await supabase
      .from('voter')
      .update({ otp: newOtp })
      .eq('email', email);

    if (error) {
      setErrorMsg('Failed to resend OTP.');
      setLoading(false);
      return;
    }

    // Send OTP via email
    try {
      await emailjs.send(
        'service_21itetw',
        'template_ks69v69',
        { email, passcode: newOtp },
        'OrOyy74P28MfrgPhr'
      );
      setSuccessMsg('New OTP sent to your email!');
      setResendTimer(60);
      setCanResend(false);
    } catch {
      setErrorMsg('Failed to send OTP email.');
    }

    setLoading(false);
  }

  return (
    <div className="verify-container">
      <div className="verify-card">
        <h2>OTP Verification</h2>
        {email && (
          <p>
            We sent an OTP to <strong>{email}</strong>. Please enter it below to verify your registration.
          </p>
        )}
        {errorMsg && <div className="error-msg">{errorMsg}</div>}
        {successMsg && <div className="success-msg">{successMsg}</div>}
        <form
          onSubmit={e => {
            e.preventDefault();
            verifyOtp();
          }}
        >
          <label htmlFor="otp">Enter OTP</label>
          <input
            id="otp"
            name="otp"
            type="text"
            maxLength={6}
            required
            value={otpInput}
            onChange={e => setOtpInput(e.target.value)}
            pattern="\d{6}"
            placeholder="6-digit OTP"
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>
        <button
          className="resend-btn"
          onClick={handleResendOtp}
          disabled={!canResend || loading}
        >
          {canResend ? 'Resend OTP' : `Resend in ${resendTimer}s`}
        </button>
      </div>
      <style jsx>{`
        .verify-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: linear-gradient(135deg, #e0e7ff 0%, #f3f4f6 100%);
        }
        .verify-card {
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.08);
          padding: 2rem 2.5rem;
          max-width: 400px;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        h2 {
          margin-bottom: 1.2rem;
          color: #2d3748;
        }
        label {
          align-self: flex-start;
          margin-top: 1.2rem;
          margin-bottom: 0.3rem;
          color: #4a5568;
        }
        input {
          width: 100%;
          padding: 0.6rem 0.8rem;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          margin-bottom: 1rem;
          background: #f8fafc;
          font-size: 1rem;
          letter-spacing: 0.2em;
          text-align: center;
        }
        button {
          width: 100%;
          padding: 0.8rem 0;
          background: #3b82f6;
          color: #fff;
          border: none;
          border-radius: 6px;
          font-size: 1.05rem;
          font-weight: 500;
          cursor: pointer;
          margin-top: 0.5rem;
          margin-bottom: 0.5rem;
          transition: background 0.2s;
        }
        button.resend-btn {
          background: #64748b;
          color: #fff;
          margin-top: 0.5rem;
        }
        button:disabled {
          background: #a5b4fc;
          cursor: not-allowed;
        }
        .error-msg {
          width: 100%;
          margin-bottom: 1rem;
          color: #ef4444;
          background: #fee2e2;
          padding: 0.7rem;
          border-radius: 4px;
          text-align: center;
          font-size: 0.98rem;
        }
        .success-msg {
          width: 100%;
          margin-bottom: 1rem;
          color: #22c55e;
          background: #dcfce7;
          padding: 0.7rem;
          border-radius: 4px;
          text-align: center;
          font-size: 0.98rem;
        }
        @media (max-width: 500px) {
          .verify-card {
            padding: 1rem 0.5rem;
          }
        }
      `}</style>
    </div>
  );
}
