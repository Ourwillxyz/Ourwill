import { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../src/supabaseClient';
import emailjs from '@emailjs/browser'; // or your preferred email/SMS provider

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Generate a 6-digit OTP
  const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

  // Send OTP via EmailJS
  const sendOtpEmail = async (email, otp) => {
    try {
      await emailjs.send(
        'service_21itetw',
        'template_ks69v69',
        { email, passcode: otp },
        'OrOyy74P28MfrgPhr'
      );
      return true;
    } catch (err) {
      setErrorMsg('Failed to send OTP email');
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    // Normalize email for lookup/storage
    const inputEmail = email.trim().toLowerCase();
    // 1. Check if voter exists
    const { data: voter, error } = await supabase
      .from('voter')
      .select('*')
      .eq('email', inputEmail)
      .single();

    if (error) {
      setErrorMsg('Database error: ' + error.message);
      setLoading(false);
      return;
    }

    if (!voter) {
      setErrorMsg('No voter found with this email. Please register first.');
      setLoading(false);
      return;
    }

    // 2. Generate OTP and store in otp_verification
    const otp = generateOtp();
    const { error: otpError } = await supabase.from('otp_verification').insert([
      {
        email: inputEmail,
        otp,
        expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 min expiry
        used: false,
        purpose: 'login'
      }
    ]);
    if (otpError) {
      setErrorMsg('Failed to store OTP: ' + otpError.message);
      setLoading(false);
      return;
    }

    // 3. Send OTP
    const sent = await sendOtpEmail(inputEmail, otp);
    if (!sent) {
      setLoading(false);
      return;
    }

    setSuccessMsg('OTP sent! Please check your email.');

    // 4. Redirect to verify page
    setTimeout(() => {
      router.push({
        pathname: '/verify',
        query: {
          email: inputEmail,
          mode: 'login'
        }
      });
    }, 1500);

    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f8fafc',
      padding: '2rem'
    }}>
      <div style={{
        background: '#fff',
        padding: '2rem',
        borderRadius: '10px',
        boxShadow: '0 2px 20px #e5e7eb',
        maxWidth: '400px',
        width: '100%'
      }}>
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Login</h2>
        {errorMsg && <div style={{
          color: '#ef4444',
          background: '#fee2e2',
          padding: '0.7rem',
          borderRadius: '4px',
          textAlign: 'center',
          marginBottom: '1rem'
        }}>{errorMsg}</div>}
        {successMsg && <div style={{
          color: '#22c55e',
          background: '#dcfce7',
          padding: '0.7rem',
          borderRadius: '4px',
          textAlign: 'center',
          marginBottom: '1rem'
        }}>{successMsg}</div>}
        <form onSubmit={handleSubmit}>
          <label htmlFor="email" style={{ display: 'block', marginBottom: '0.3rem', color: '#4a5568' }}>Email</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{
              width: '100%',
              padding: '0.6rem 0.8rem',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              marginBottom: '0.8rem',
              background: '#fff',
              color: '#000'
            }}
          />
          <button type="submit" disabled={loading} style={{
            width: '100%',
            padding: '0.8rem 0',
            background: '#3b82f6',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontWeight: '500',
            cursor: 'pointer',
            marginTop: '1rem'
          }}>
            {loading ? 'Processing...' : 'Send OTP'}
          </button>
        </form>
      </div>
    </div>
  );
}
