import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../src/supabaseClient';

export default function Verify() {
  const router = useRouter();
  const { email = '', mode = '' } = router.query;
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // For SSR or NEXT router.query fallback
  useEffect(() => {
    if (!mode && typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('mode')) router.replace({ pathname: '/verify', query: { email: params.get('email'), mode: params.get('mode') } });
    }
  }, [mode, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');

    if (!otp) {
      setErrorMsg('Please enter OTP');
      setLoading(false);
      return;
    }

    try {
      // Example: custom OTP verification logic (replace with your own if using a custom table)
      // If using Supabase Auth, you can use signInWithOtp:
      if (mode === 'login') {
        // Attempt login via Supabase Auth with OTP
        const { data, error } = await supabase.auth.verifyOtp({
          email,
          token: otp,
          type: 'email'
        });
        if (error) {
          setErrorMsg('OTP verification failed: ' + error.message);
          setLoading(false);
          return;
        }
        setSuccessMsg('Login successful! Redirecting to dashboard...');
        setLoading(false);
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
        return;
      }

      // Registration flow: custom verification logic
      if (mode === 'register') {
        // Example: update your OTP table, mark as used, create user, etc.
        // For this template, we'll just simulate success.
        setSuccessMsg('Verification successful! You are now registered.');
        setLoading(false);
        setTimeout(() => {
          router.push('/login');
        }, 2000);
        return;
      }

      // Fallback: just show generic message and redirect to login
      setSuccessMsg('Verification successful.');
      setLoading(false);
      setTimeout(() => {
        router.push('/login');
      }, 2000);

    } catch (err) {
      setErrorMsg('Verification error: ' + err.message);
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#fafcff'
    }}>
      <form onSubmit={handleSubmit} style={{
        background: '#fff',
        padding: '2rem 2.5rem',
        borderRadius: '10px',
        boxShadow: '0 3px 20px rgba(0,0,0,0.09)',
        minWidth: '320px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <h2 style={{ marginBottom: '1.5rem', fontWeight: '500' }}>
          Verify your email
        </h2>
        <p style={{ marginBottom: '1rem', color: '#444', fontSize: '1.05rem' }}>
          Enter the OTP sent to <strong>{email || 'your email'}</strong>
        </p>
        <input
          type="text"
          maxLength={6}
          autoFocus
          value={otp}
          onChange={e => setOtp(e.target.value)}
          placeholder="Enter OTP"
          style={{
            padding: '0.6rem',
            fontSize: '1.1rem',
            borderRadius: '6px',
            border: '1px solid #ccc',
            marginBottom: '1rem',
            width: '100%',
            textAlign: 'center'
          }}
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            background: '#0984e3',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            padding: '0.7rem 1.6rem',
            fontSize: '1.08rem',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Verifying...' : 'Verify'}
        </button>
        {successMsg && (
          <div style={{
            color: '#00b894',
            marginTop: '1.2rem',
            fontWeight: '500',
            textAlign: 'center'
          }}>
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div style={{
            color: '#d63031',
            marginTop: '1.2rem',
            fontWeight: '500',
            textAlign: 'center'
          }}>
            {errorMsg}
          </div>
        )}
      </form>
    </div>
  );
}
