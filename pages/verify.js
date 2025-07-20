import { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../src/supabaseClient';

export default function Verify() {
  const router = useRouter();
  const email = router.query.email || '';
  const mode = router.query.mode || '';
  const [otp, setOtp] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    if (mode === 'login') {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email'
      });
      if (error) {
        setMsg('OTP verification failed: ' + error.message);
      } else {
        setMsg('Login successful! Redirecting...');
        setTimeout(() => router.push('/dashboard'), 1500);
      }
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleVerify}>
      <input
        type="text"
        value={otp}
        onChange={e => setOtp(e.target.value)}
        placeholder="Enter OTP"
        required
        maxLength={6}
        disabled={loading}
      />
      <button type="submit" disabled={loading || !otp}>Verify OTP</button>
      {msg && <div>{msg}</div>}
    </form>
  );
}
