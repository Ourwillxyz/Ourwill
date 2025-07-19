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
    // Send Magic Link via Supabase Auth
    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) {
      setMsg('Error: ' + error.message);
    } else {
      setMsg('A login link has been sent! Please check your email and follow the link to continue.');
      // Optionally: you can stay on the page or redirect.
      // router.push(`/verify?email=${encodeURIComponent(email)}&mode=login`);
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Gradient background */}
      <div style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        background: 'linear-gradient(135deg, #ece9f7 0%, #fff 100%)',
        zIndex: 0
      }} />
      {/* Semi-opaque overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(42, 43, 53, 0.52)',
        zIndex: 1
      }} />
      {/* Centered login box */}
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        zIndex: 2
      }}>
        <div style={{
          maxWidth: 400,
          width: '100%',
          padding: 32,
          borderRadius: 16,
          boxShadow: '0 4px 24px rgba(0,0,0,0.17)',
          background: '#fff',
          textAlign: 'center',
          position: 'relative'
        }}>
          {/* Logo and Flag Section in a row */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 24,
            gap: 16
          }}>
            <img
              src="/ourwill-logo.png"
              alt="OurWill Logo"
              style={{
                width: 80,
                height: 'auto',
                borderRadius: 12,
                boxShadow: '0 2px 8px rgba(79,70,229,0.08)'
              }}
            />
            <img
              src="/kenya-flag.jpg"
              alt="Kenya Flag"
              style={{
                width: 48,
                height: 32,
                borderRadius: 6,
                border: '1px solid #e5e7eb',
                objectFit: 'cover',
                boxShadow: '0 2px 8px rgba(79,70,229,0.04)'
              }}
            />
          </div>
          <h2 style={{
            margin: '0 0 16px 0',
            fontWeight: 700,
            fontSize: '1.6rem',
            color: '#4733a8'
          }}>
            Login to OurWill
          </h2>
          <form onSubmit={handleLogin}>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px 16px',
                marginBottom: 16,
                borderRadius: 8,
                border: '1px solid #d1d5db',
                fontSize: '1rem',
                background: '#f7f7fa'
              }}
            />
            <button
              type="submit"
              disabled={loading || !email}
              style={{
                width: '100%',
                padding: '12px 0',
                borderRadius: 8,
                border: 'none',
                background: loading ? '#a5b4fc' : '#4f46e5',
                color: '#fff',
                fontWeight: 600,
                fontSize: '1rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s'
              }}
            >
              {loading ? 'Sending...' : 'Send Magic Link'}
            </button>
            {msg && (
              <div style={{
                marginTop: 16,
                color: msg.startsWith('Error') ? '#dc2626' : '#4f46e5',
                fontWeight: 500
              }}>
                {msg}
              </div>
            )}
            <div style={{ marginTop: 24, color: '#555', fontSize: '0.97em', lineHeight: 1.5 }}>
              <p>
                <strong>Note:</strong> To continue, go to your email and follow the login link we sent you.
              </p>
              <p>
                If you don't see the email, check your spam or promotions folder.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
