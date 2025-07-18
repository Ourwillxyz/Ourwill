import { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../src/supabaseClient';
import sha256 from 'crypto-js/sha256';
import emailjs from '@emailjs/browser';

export default function Verify() {
  const router = useRouter();
  const email = router.query.email || '';
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [resending, setResending] = useState(false);

  // Verify OTP handler
  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const otp_hash = sha256(otp).toString();

    // Query voter by email and hashed OTP
    const { data: voter, error: findError } = await supabase
      .from('voter')
      .select('*')
      .eq('email', email)
      .eq('otp_hash', otp_hash)
      .single();

    if (findError || !voter) {
      setErrorMsg('Invalid OTP or email. Please check and try again.');
      setLoading(false);
      return;
    }

    // Update status to 'verified'
    const { error: updateError } = await supabase
      .from('voter')
      .update({ status: 'verified' })
      .eq('id', voter.id);

    if (updateError) {
      setErrorMsg('Verification succeeded, but failed to update status.');
      setLoading(false);
      return;
    }

    setSuccessMsg('OTP verified! Redirecting to login...');
    setLoading(false);

    setTimeout(() => {
      router.replace('/login');
    }, 1200);
  };

  // Generate a 6-digit OTP
  const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

  // Resend OTP handler
  const handleResendOtp = async () => {
    setResending(true);
    setErrorMsg('');
    setSuccessMsg('');

    const newOtp = generateOtp();
    const otp_hash = sha256(newOtp).toString();

    // Update the user's otp_hash in the voter table
    const { error: updateError } = await supabase
      .from('voter')
      .update({ otp_hash })
      .eq('email', email);

    if (updateError) {
      setErrorMsg('Failed to update OTP. Please try again.');
      setResending(false);
      return;
    }

    // Send the new OTP via EmailJS
    try {
      await emailjs.send(
        'service_21itetw',
        'template_ks69v69',
        { email, passcode: newOtp },
        'OrOyy74P28MfrgPhr'
      );
      setSuccessMsg('A new OTP has been sent to your email!');
    } catch (err) {
      setErrorMsg('Failed to send the OTP email. Please try again.');
    }

    setResending(false);
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', flexDirection: 'column'
    }}>
      <img src="/ourwill-logo.png" alt="Logo"
        style={{ width: '180px', marginBottom: '2rem' }} />
      <form onSubmit={handleVerify}
        style={{
          background: 'white', padding: '2rem', borderRadius: 10,
          maxWidth: 400, width: '100%', boxShadow: '0 2px 16px #0001'
        }}>
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Verify OTP</h2>
        <p style={{ margin: '0 0 1rem 0', textAlign: 'center' }}>
          Enter the 6-digit OTP sent to <strong>{email}</strong>
        </p>
        <input
          type="text"
          placeholder="OTP code"
          value={otp}
          required
          onChange={(e) => setOtp(e.target.value)}
          pattern="\d{6}"
          maxLength={6}
          style={{
            width: '100%', padding: '0.75rem', marginBottom: '1rem',
            letterSpacing: 8, textAlign: 'center'
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%', padding: '0.75rem',
            background: '#006400', color: '#fff', border: 'none', borderRadius: 4
          }}>
          {loading ? 'Verifying...' : 'Verify OTP'}
        </button>
        <button
          type="button"
          onClick={handleResendOtp}
          disabled={resending}
          style={{
            width: '100%', padding: '0.75rem', marginTop: '1rem',
            background: '#2563eb', color: '#fff', border: 'none', borderRadius: 4,
            opacity: resending ? 0.7 : 1
          }}>
          {resending ? 'Resending...' : 'Resend OTP'}
        </button>
        {errorMsg && <p style={{ color: 'red', marginTop: '1rem' }}>{errorMsg}</p>}
        {successMsg && <p style={{ color: 'green', marginTop: '1rem' }}>{successMsg}</p>}
      </form>
    </div>
  );
}
