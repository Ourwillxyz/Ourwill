import { useState } from 'react';
import { supabase } from '../src/supabaseClient';

export default function RegisterUser() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [info, setInfo] = useState('');

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
      paddingTop: '4rem',
      fontFamily: 'Arial, sans-serif',
      color: '#222',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      <img
        src="/ourwill-logo.png"
        alt="OurWill Logo"
        style={{ width: '200px', height: 'auto', marginBottom: '2rem' }}
      />

      <form onSubmit={handleRegister} style={{
        background: 'white',
        padding: '2rem',
        borderRadius: 8,
        boxShadow: '0 0 10px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: 400
      }}>
        <label>Full Name:<br />
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Jane Doe"
            required
            style={{ width: '100%', padding: 10, marginTop: 4, marginBottom: 16 }}
          />
        </label>
        <label>Mobile Number:<br />
          <input
            type="text"
            value={mobile}
            onChange={e => setMobile(e.target.value)}
            placeholder="2547XXXXXXXX"
            required
            style={{ width: '100%', padding: 10, marginTop: 4, marginBottom: 16 }}
          />
        </label>
        <label>Email Address:<br />
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            style={{ width: '100%', padding: 10, marginTop: 4, marginBottom: 16 }}
          />
        </label>
        <button type="submit" style={{
          width: '100%',
          padding: '12px',
          backgroundColor: '#0070f3',
          color: 'white',
          border: 'none',
          borderRadius: 4,
          fontSize: '1rem',
          cursor: 'pointer'
        }}>
          Send Magic Link
        </button>
      </form>

      {info && (
        <p style={{ marginTop: 20, color: info.includes('✅') ? 'green' : 'red' }}>
          {info}
        </p>
      )}
    </div>
  );
}
