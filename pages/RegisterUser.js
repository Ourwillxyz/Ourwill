// pages/RegisterUser.js
import { useState } from 'react';

export default function RegisterUser() {
  const [email, setEmail] = useState('');
  const [info, setInfo] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setInfo('Sending magic link...');

    try {
      const res = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (data.success) {
        setInfo('✅ Magic link sent! Please check your email.');
      } else {
        setInfo(`❌ ${data.message || 'Failed to send magic link.'}`);
      }
    } catch (err) {
      console.error('Error:', err);
      setInfo('❌ Unexpected error. Please try again.');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '3rem auto', textAlign: 'center' }}>
      <h2>Register or Login via Email</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: 10, width: '90%', margin: '1rem 0' }}
        />
        <br />
        <button type="submit" style={{ padding: '10px 20px' }}>
          Send Magic Link
        </button>
      </form>
      {info && <p style={{ marginTop: '1rem' }}>{info}</p>}
    </div>
  );
}
