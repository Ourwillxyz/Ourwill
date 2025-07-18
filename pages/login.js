import { useState } from 'react';
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
      // Redirect to OTP verification page, passing the email
      router.push({ pathname: '/verify', query: { email } });
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
