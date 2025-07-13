import { useState, useEffect } from 'react';
import { supabase } from '../src/supabaseClient';
import { useRouter } from 'next/router';

export default function RegisterUser() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [info, setInfo] = useState('');
  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!email || !name || !mobile) {
      setInfo('Please fill in all fields.');
      return;
    }

    setInfo('Sending magic link...');

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/callback`,
      },
    });

    if (error) {
      console.error('Magic link error:', error.message);
      setInfo('❌ Failed to send magic link. Try again.');
    } else {
      setInfo('✅ Magic link sent! Check your inbox.');
    }
  };

  return (
    <div style={{
      background: '#f4faff',
      minHeight: '100vh',
      padding: '2rem',
      fontFamily: 'Arial, sans-serif',
      color: '#222',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      <img src="/ourwill-logo.png" alt="OurWill Logo" style={{ width: 120, marginBottom: 20 }} />
      <h2 style={{ color: '#0070f3' }}>User Registration</h2>
      <form onSubmit={handleRegister} style={{
        background: 'white',
        padding: '2rem',
        borderRadius: 8,
        boxShadow: '0 0 10px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: 400
      }}>
        <label>Name:<br />
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Full Name"
            required
            style={{ width: '100%', padding: 8, marginTop: 4, marginBottom: 12 }}
          />
        </label>
        <label>Mobile Number:<br />
          <input
            type="text"
            value={mobile}
            onChange={e => setMobile(e.target.value)}
            placeholder="e.g. 2547XXXXXXX"
            required
            style={{ width: '100%', padding: 8, marginTop: 4, marginBottom: 12 }}
          />
        </label>
        <label>Email Address:<br />
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            style={{ width: '100%', padding: 8, marginTop: 4, marginBottom: 12 }}
          />
        </label>
        <button type="submit" style={{
          width: '100%',
          padding: '10px 0',
          backgroundColor: '#0070f3',
          color: 'white',
          border: 'none',
          borderRadius: 4,
          cursor: 'pointer'
        }}>
          Register
        </button>
      </form>

      {info && (
        <p style={{ marginTop: 16, color: info.includes('✅') ? 'green' : 'red' }}>
          {info}
        </p>
      )}
    </div>
  );
}
