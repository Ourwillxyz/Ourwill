// pages/Login.js

import { useState } from 'react';
import { supabase } from '../src/supabaseClient';

export default function Login() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: 'https://your-vercel-app.vercel.app/callback', // must match Supabase allowed redirects
      },
    });

    if (error) {
      setMessage('❌ Error sending magic link: ' + error.message);
    } else {
      setMessage('✅ Magic link sent! Check your inbox.');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: 'auto', paddingTop: 40 }}>
      <h2>Login via Magic Link</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Enter your email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: 8, width: '100%', marginBottom: 12 }}
        />
        <button type="submit" style={{ padding: '8px 16px' }}>Send Magic Link</button>
      </form>
      {message && <p style={{ marginTop: 16 }}>{message}</p>}
    </div>
  );
}
