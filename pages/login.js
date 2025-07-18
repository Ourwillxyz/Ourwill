import { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../src/supabaseClient';
import emailjs from '@emailjs/browser';

export default function Login() {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState(1); // 1: enter email, 2: enter OTP
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  // Step 1: Request OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Generate OTP
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

    // Insert OTP record
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
      setStep(2); // Move to OTP entry step
    } catch (err) {
      setError('Failed to send OTP email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Fetch latest unused OTP for this email
    const { data, error: fetchError } = await supabase
      .from('otp_verification')
      .select('*')
      .eq('email', email)
      .eq('used', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (fetchError || !data) {
      setError('Could not verify OTP. Please request a new OTP.');
      setLoading(false);
      return;
    }

    if (data.otp !== otp) {
      setError('Incorrect OTP. Please check your email and try again.');
      setLoading(false);
      return;
    }

    // Mark OTP as used
    await supabase
      .from('otp_verification')
      .update({ used: true })
      .eq('email', email)
      .eq('otp', otp);

    // Save login and redirect
    localStorage.setItem('user_email', email);
    router.push('/dashboard');
    setLoading(false);
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

      {step === 1 ? (
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
          <button type="submit" style={{ width: '100%', padding: '0.75rem', backgroundColor: '#006400', color: '#fff' }} disabled={loading}>
            {loading ? 'Requesting OTP...' : 'Request OTP'}
          </button>
          {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}
        </form>
      ) : (
        <form
          onSubmit={handleVerifyOtp}
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            padding: '2rem',
            borderRadius: '10px',
            width: '100%',
            maxWidth: '400px',
          }}
        >
          <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Enter OTP</h2>
          <p style={{ marginBottom: '1rem', textAlign: 'center' }}>
            We sent a 6-digit OTP to <b>{email}</b>. Enter it below.
          </p>
          <input
            type="text"
            placeholder="OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
            style={{ width: '100%', padding: '0.75rem', marginBottom: '1rem', letterSpacing: '0.2em', textAlign: 'center' }}
            maxLength={6}
          />
          <button type="submit" style={{ width: '100%', padding: '0.75rem', backgroundColor: '#006400', color: '#fff' }} disabled={loading}>
            {loading ? 'Verifying...' : 'Login'}
          </button>
          {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}
        </form>
      )}
    </div>
  );
}// pages/Login.js

import { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../src/supabaseClient';

export default function Login() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    const { data, error } = await supabase
      .from('otp_verification')
      .select('*')
      .eq('email', email)
      .eq('passcode', otp)
      .single();

    if (error || !data) {
      setError('Invalid email or OTP');
    } else {
      localStorage.setItem('user_email', email);
      router.push('/dashboard');
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
        onSubmit={handleLogin}
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

        <input
          type="text"
          placeholder="OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
          style={{ width: '100%', padding: '0.75rem', marginBottom: '1rem' }}
        />

        <button type="submit" style={{ width: '100%', padding: '0.75rem', backgroundColor: '#006400', color: '#fff' }}>
          Login
        </button>

        {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}
      </form>
    </div>
  );
}
