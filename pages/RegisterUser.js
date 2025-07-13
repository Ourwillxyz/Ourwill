// pages/RegisterUser.js
import { useState } from 'react';
import { supabase } from '../src/supabaseClient';

export default function RegisterUser() {
  const [username, setUsername] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!username || username.length < 3) {
      setInfo('Username is required');
      return;
    }

    if (!/^[0-9]{9}$/.test(mobile)) {
      setInfo('Mobile must be 9 digits (e.g. 712345678)');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setInfo('Enter a valid email');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ email });

    if (error) {
      setInfo('❌ Failed to send login link. Try again.');
    } else {
      setInfo('✅ Check your email for the magic link!');
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: 480, margin: 'auto' }}>
      <h2>Register / Login</h2>
      <form onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          style={{ display: 'block', marginBottom: 12, padding: 8, width: '100%' }}
        />
        <input
          type="text"
          placeholder="Mobile (712345678)"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
          required
          style={{ display: 'block', marginBottom: 12, padding: 8, width: '100%' }}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ display: 'block', marginBottom: 12, padding: 8, width: '100%' }}
        />
        <button type="submit" disabled={loading} style={{ padding: 10 }}>
          {loading ? 'Sending...' : 'Register/Login'}
        </button>
      </form>
      {info && <p style={{ marginTop: 12 }}>{info}</p>}
    </div>
  );
}
