import { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../src/supabaseClient';

export default function VerifyOtp() {
  const router = useRouter();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // These fields should be passed from the registration step (via router.query)
  const {
    email = '',
    mobile = '',
    username = '',
    county = '',
    subcounty = '',
    ward = '',
    polling_centre = '',
    mode = '',
  } = router.query;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    // 1. Verify OTP from otp_verification table
    const { data: otpRecord, error: otpError } = await supabase
      .from('otp_verification')
      .select('*')
      .eq('email', email)
      .eq('otp', otp)
      .eq('used', false)
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (otpError) {
      setErrorMsg('Failed to check OTP: ' + otpError.message);
      setLoading(false);
      return;
    }
    if (!otpRecord) {
      setErrorMsg('Invalid or expired OTP. Please try again.');
      setLoading(false);
      return;
    }

    // 2. Mark OTP as used
    const { error: updateError } = await supabase
      .from('otp_verification')
      .update({ used: true })
      .eq('id', otpRecord.id);

    if (updateError) {
      setErrorMsg('Failed to update OTP status: ' + updateError.message);
      setLoading(false);
      return;
    }

    // 3. Create voter record if not exists (for registration mode)
    if (mode === 'register') {
      // Check if voter already exists
      const { data: existingVoter } = await supabase
        .from('voter')
        .select('id')
        .eq('email', email)
        .single();

      if (!existingVoter) {
        const { error: voterError } = await supabase.from('voter').insert([
          {
            email,
            mobile,
            username,
            county,
            subcounty,
            ward,
            polling_centre,
            status: 'active',
          },
        ]);
        if (voterError) {
          setErrorMsg('Failed to register voter: ' + voterError.message);
          setLoading(false);
          return;
        }
      }

      setSuccessMsg('Verification successful! You are now registered.');
      setLoading(false);

      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } else if (mode === 'login') {
      setSuccessMsg('Login successful! Redirecting to dashboard...');
      setLoading(false);

      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } else {
      // fallback, redirect to login
      setSuccessMsg('Verification successful.');
      setLoading(false);

      setTimeout(() => {
        router.push('/login');
      }, 2000);
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

      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: '2rem',
        borderRadius: '10px',
        width: '100%',
        maxWidth: '400px',
      }}>
        <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
          OTP Verification
        </h2>
        {errorMsg && <div style={{
          width: '100%',
          marginBottom: '1rem',
          color: '#ef4444',
          background: '#fee2e2',
          padding: '0.7rem',
          borderRadius: '4px',
          textAlign: 'center',
          fontSize: '0.98rem',
        }}>{errorMsg}</div>}
        {successMsg && <div style={{
          width: '100%',
          marginBottom: '1rem',
          color: '#22c55e',
          background: '#dcfce7',
          padding: '0.7rem',
          borderRadius: '4px',
          textAlign: 'center',
          fontSize: '0.98rem',
        }}>{successMsg}</div>}
        <form onSubmit={handleSubmit}>
          <label htmlFor="otp" style={{ display: 'block', marginTop: '1rem', marginBottom: '0.3rem', color: '#4a5568', fontSize: '0.97rem' }}>
            Enter OTP sent to your email
          </label>
          <input
            id="otp"
            name="otp"
            type="text"
            placeholder="6-digit OTP"
            required
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            style={{ width: '100%', padding: '0.6rem 0.8rem', border: '1px solid #cbd5e1', borderRadius: '6px', marginBottom: '0.8rem', background: '#f8fafc', fontSize: '1rem' }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.8rem 0',
              background: '#3b82f6',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '1.05rem',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'background 0.2s',
              marginTop: '1rem',
            }}
          >
            {loading ? 'Verifying...' : 'Verify'}
          </button>
        </form>
      </div>
    </div>
  );
}
