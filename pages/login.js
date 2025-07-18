import { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../src/supabaseClient';

export default function Login() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    // Supabase OTP Auth (v2+)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true }
    });

    if (error) {
      setErrorMsg(error.message || 'Failed to send OTP. Try again.');
      setLoading(false);
      return;
    }

    setSuccessMsg('OTP sent! Check your email.');
    setLoading(false);
    // Pass email to verify page
    router.push({ pathname: '/verify', query: { email } });
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', flexDirection: 'column'
    }}>
      <img src="/ourwill-logo.png" alt="Logo"
        style={{ width: '180px', marginBottom: '2rem' }} />
      <form onSubmit={handleLogin}
        style={{
          background: 'white', padding: '2rem', borderRadius: 10,
          maxWidth: 400, width: '100%', boxShadow: '0 2px 16px #0001'
        }}>
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Login</h2>
        <input
          type="email"
          placeholder="Email address"
          value={email}
          required
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: '100%', padding: '0.75rem', marginBottom: '1rem' }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%', padding: '0.75rem',
            background: '#006400', color: '#fff', border: 'none', borderRadius: 4
          }}>
          {loading ? 'Requesting OTP...' : 'Send OTP'}
        </button>
        {errorMsg && <p style={{ color: 'red', marginTop: '1rem' }}>{errorMsg}</p>}
        {successMsg && <p style={{ color: 'green', marginTop: '1rem' }}>{successMsg}</p>}
      </form>
    </div>
  );
}
