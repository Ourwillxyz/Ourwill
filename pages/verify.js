import { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../src/supabaseClient';

export default function Verify() {
  const router = useRouter();
  const email = router.query.email || '';

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    // Supabase expects a 6-digit code and the email
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'email', // 'email' for email OTP
    });

    if (error) {
      setErrorMsg(error.message || 'Invalid OTP. Try again.');
      setLoading(false);
      return;
    }

    setSuccessMsg('OTP verified! Logging you in...');
    setLoading(false);

    // Redirect to dashboard after short delay
    setTimeout(() => {
      router.replace('/dashboard');
    }, 1000);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
      <img src="/ourwill-logo.png" alt="Logo" style={{ width: '180px', marginBottom: '2rem' }} />
      <form
        onSubmit={handleVerify}
        style={{
          background: 'white', padding: '2rem', borderRadius: 10, maxWidth: 400, width: '100%', boxShadow: '0 2px 16px #0001'
        }}
      >
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Verify OTP</h2>
        <p style={{ margin: '0 0 1rem 0', textAlign: 'center' }}>
          Enter the 6-digit OTP sent to <strong>{email}</strong>
        </p>
        <input
          type="text"
          placeholder="OTP code"
          value={otp}
          required
          onChange={(e) => setOtp(e.target.value)}
          pattern="\d{6}"
          maxLength={6}
          style={{ width: '100%', padding: '0.75rem', marginBottom: '1rem', letterSpacing: 8, textAlign: 'center' }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{ width: '100%', padding: '0.75rem', background: '#006400', color: '#fff', border: 'none', borderRadius: 4 }}
        >
          {loading ? 'Verifying...' : 'Verify OTP'}
        </button>
        {errorMsg && <p style={{ color: 'red', marginTop: '1rem' }}>{errorMsg}</p>}
        {successMsg && <p style={{ color: 'green', marginTop: '1rem' }}>{successMsg}</p>}
      </form>
    </div>
  );
}
