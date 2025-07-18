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

    // Send OTP request (Supabase will send email)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true }, // Create new user if doesn't exist
    });

    if (error) {
      setErrorMsg(error.message || 'Failed to send OTP. Try again.');
      setLoading(false);
      return;
    }

    setSuccessMsg('OTP sent! Check your email.');
    setLoading(false);

    // Redirect to verify page with email in query
    router.push({ pathname: '/verify', query: { email } });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
      <img src="/ourwill-logo.png" alt="Logo" style={{ width: '180px', marginBottom: '2rem' }} />
      <form
        onSubmit={handleLogin}
        style={{
          background: 'white', padding: '2rem', borderRadius: 10, maxWidth: 400, width: '100%', boxShadow: '0 2px 16px #0001'
        }}
      >
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
          style={{ width: '100%', padding: '0.75rem', background: '#006400', color: '#fff', border: 'none', borderRadius: 4 }}
        >
          {loading ? 'Requesting OTP...' : 'Send OTP'}
        </button>
        {errorMsg && <p style={{ color: 'red', marginTop: '1rem' }}>{errorMsg}</p>}
        {successMsg && <p style={{ color: 'green', marginTop: '1rem' }}>{successMsg}</p>}
      </form>
    </div>
  );
}import { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../src/supabaseClient';
import emailjs from '@emailjs/browser';

export default function Login() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  // Handle requesting OTP and redirect to OTP page
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Optional: validate email format client-side
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address.');
      setLoading(false);
      return;
    }

    // Generate OTP
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

    // Insert OTP record into otp_verification table
    const { error: dbError } = await supabase.from('otp_verification').insert({
      email,
      otp: generatedOtp,
      used: false,
      resend_count: 1,
      created_at: new Date().toISOString(),
    });

    if (dbError) {
      setError('Failed to request OTP. Please try again.');
      setLoading(false);
      return;
    }

    // Send OTP via email
    try {
      await emailjs.send(
        'service_21itetw',
        'template_ks69v69',
        { email, passcode: generatedOtp },
        'OrOyy74P28MfrgPhr'
      );
      // Redirect to OTP verification page, passing the email AND mode
      router.push({ pathname: '/verify', query: { email, mode: 'login' } });
    } catch (err) {
      setError('Failed to send OTP email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundImage: 'url("/kenya-flag.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        padding: '2rem',
      }}
    >
      <img src="/ourwill-logo.png" alt="OurWill Logo" style={{ width: '180px', marginBottom: '1.5rem' }} />

      <form
        onSubmit={handleRequestOtp}
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          padding: '2rem',
          borderRadius: '10px',
          width: '100%',
          maxWidth: '400px',
        }}
      >
        <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Login</h2>
        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: '100%', padding: '0.75rem', marginBottom: '1rem' }}
        />
        <button
          type="submit"
          style={{ width: '100%', padding: '0.75rem', backgroundColor: '#006400', color: '#fff' }}
          disabled={loading}
        >
          {loading ? 'Requesting OTP...' : 'Login / Request OTP'}
        </button>
        {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}
      </form>
    </div>
  );
}
