import { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../src/supabaseClient';

export default function Login() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    // Send OTP via Supabase Auth
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) {
      setMsg('Error: ' + error.message);
    } else {
      setMsg('OTP sent! Check your email and enter the code below.');
      // Redirect to verify page with email and mode
      router.push(`/verify?email=${encodeURIComponent(email)}&mode=login`);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Email"
        required
        disabled={loading}
      />
      <button type="submit" disabled={loading || !email}>Send OTP</button>
      {msg && <div>{msg}</div>}
    </form>
  );
}
