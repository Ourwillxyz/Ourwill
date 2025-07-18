import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { supabase } from '../src/supabaseClient';

export default function Verify() {
  const router = useRouter();
  const { email, mode } = router.query; // mode: 'login' or 'register'

  const [otpInput, setOtpInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Redirect if email or mode is missing
  useEffect(() => {
    if (!email || !mode) {
      router.replace('/Login');
    }
  }, [email, mode, router]);

  // Handle OTP verification
  async function verifyOtp(e) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    // Fetch the latest unused OTP for this email
    const { data, error } = await supabase
      .from('otp_verification')
      .select('*')
      .eq('email', email)
      .eq('used', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      setErrorMsg('Could not verify OTP. Please request a new OTP.');
      setLoading(false);
      return;
    }

    if (data.otp !== otpInput) {
      setErrorMsg('Incorrect OTP. Please try again.');
      setLoading(false);
      return;
    }

    // Mark OTP as used
    const { error: updateError } = await supabase
      .from('otp_verification')
      .update({ used: true })
      .eq('email', email)
      .eq('otp', otpInput);

    if (updateError) {
      setErrorMsg('Failed to update OTP status. Please try again.');
      setLoading(false);
      return;
    }

    // Shared: set login state (localStorage, etc.)
    localStorage.setItem('user_email', email);

    // Branch by mode
    if (mode === 'login') {
      // Insert login record into otp_login table
      const { error: loginError } = await supabase
        .from('otp_login')
        .insert({
          email,
          login_time: new Date().toISOString(),
        });

      if (loginError) {
        setErrorMsg('Login failed. Please try again.');
        setLoading(false);
        return;
      }

      setSuccessMsg('OTP verified! Redirecting to dashboard...');
      setLoading(false);

      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } else if (mode === 'register') {
      // Create voter/user record if needed (example: voter table)
      // If user already exists, you might want to skip or update
      const { data: voterExists } = await supabase
        .from('voter')
        .select('email')
        .eq('email', email)
        .single();

      if (!voterExists) {
        // Insert into voter table (customize fields as needed)
        await supabase.from('voter').insert({
          email,
          registered_at: new Date().toISOString(),
          // other fields if needed
        });
      }

      setSuccessMsg('Registration complete! Redirecting...');
      setLoading(false);

      setTimeout(() => {
        router.push('/dashboard'); // or /welcome, /profile, etc.
      }, 1500);
    } else {
      setErrorMsg('Unknown verification mode.');
      setLoading(false);
    }
  }

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
        onSubmit={verifyOtp}
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          padding: '2rem',
          borderRadius: '10px',
          width: '100%',
          maxWidth: '400px',
        }}
      >
        <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>OTP Verification</h2>
        {email && (
          <p style={{ marginBottom: '1rem', textAlign: 'center' }}>
            Enter the OTP sent to <b>{email}</b>.
          </p>
        )}
        <input
          type="text"
          placeholder="Enter OTP"
          value={otpInput}
          onChange={(e) => setOtpInput(e.target.value)}
          required
          maxLength={6}
          style={{
            width: '100%',
            padding: '0.75rem',
            marginBottom: '1rem',
            letterSpacing: '0.2em',
            textAlign: 'center',
          }}
        />

        <button
          type="submit"
          style={{
            width: '100%',
            padding: '0.75rem',
            backgroundColor: '#006400',
            color: '#fff',
          }}
          disabled={loading}
        >
          {loading ? 'Verifying...' : 'Verify OTP'}
        </button>
        {errorMsg && <p style={{ color: 'red', marginTop: '1rem' }}>{errorMsg}</p>}
        {successMsg && <p style={{ color: 'green', marginTop: '1rem' }}>{successMsg}</p>}
      </form>
    </div>
  );
}
