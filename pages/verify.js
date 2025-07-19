import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../src/supabaseClient';

export default function Verify() {
  const router = useRouter();
  // Read query parameters robustly
  const [queryReady, setQueryReady] = useState(false);
  const [email, setEmail] = useState('');
  const [mode, setMode] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Read query params once they're available
  useEffect(() => {
    if (router.isReady) {
      let qEmail = router.query.email || '';
      let qMode = router.query.mode || '';
      // Fallback for SSR/hard refresh
      if (!qEmail || !qMode) {
        if (typeof window !== 'undefined') {
          const params = new URLSearchParams(window.location.search);
          qEmail = params.get('email') || '';
          qMode = params.get('mode') || '';
        }
      }
      setEmail(qEmail);
      setMode(qMode);
      setQueryReady(true);
    }
  }, [router.isReady, router.query]);

  // Handle OTP verification
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');

    if (!otp) {
      setErrorMsg('Please enter the OTP code.');
      setLoading(false);
      return;
    }
    if (!email) {
      setErrorMsg('Email is missing. Please return to the previous step.');
      setLoading(false);
      return;
    }
    if (!mode) {
      setErrorMsg('Verification mode missing. Please restart the process.');
      setLoading(false);
      return;
    }

    try {
      // LOGIN MODE: Use Supabase Auth OTP verification (sets session)
      if (mode === 'login') {
        // Use Supabase's verifyOtp for email-based OTP
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
        // If session is set, redirect to dashboard
        setSuccessMsg('Login successful! Redirecting to dashboard...');
        setLoading(false);
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
        return;
      }

      // REGISTRATION MODE: Example custom logic (simulate success, or call your own backend)
      if (mode === 'register') {
        // You can add your own custom verification here if needed
        setSuccessMsg('Verification successful! You are now registered.');
        setLoading(false);
        setTimeout(() => {
          router.push('/login');
        }, 2000);
        return;
      }

      // FALLBACK: Any other mode, redirect to login
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

  // UI
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f8faff'
    }}>
      <form onSubmit={handleSubmit} style={{
        background: '#fff',
        padding: '2rem 2.5rem',
        borderRadius: '10px',
        boxShadow: '0 3px 20px rgba(0,0,0,0.09)',
        minWidth: '340px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <h2 style={{ marginBottom: '1.5rem', fontWeight: '500' }}>
          Verify your email
        </h2>
        <p style={{
          marginBottom: '1rem',
          color: '#444',
          fontSize: '1.05rem',
          textAlign: 'center'
        }}>
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
            letterSpacing: '0.12em',
            textAlign: 'center'
          }}
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !queryReady}
          style={{
            background: '#0984e3',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            padding: '0.7rem 1.6rem',
            fontSize: '1.08rem',
            cursor: loading || !queryReady ? 'not-allowed' : 'pointer'
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
