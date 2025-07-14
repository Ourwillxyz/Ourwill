// pages/verify.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../src/supabaseClient';
import sha256 from 'crypto-js/sha256';

export default function Verify() {
  const [otp, setOtp] = useState('');
  const [info, setInfo] = useState('');
  const router = useRouter();

  const [email, setEmail] = useState('');

  useEffect(() => {
    // Get email from pending registration
    const pending = JSON.parse(localStorage.getItem('pending_registration') || '{}');
    if (pending?.email) {
      setEmail(pending.email);
    }
  }, []);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) return setInfo('❌ Enter a valid 6-digit OTP.');

    setInfo('⏳ Verifying...');

    // Step 1: Check OTP validity
    const { data: match, error: otpError } = await supabase
      .from('otp_verification')
      .select('*')
      .eq('email', email)
      .eq('otp', otp)
      .eq('used', false)
      .lte('expires_at', new Date().toISOString())
      .maybeSingle();

    if (!match || otpError) {
      return setInfo('❌ Invalid or expired OTP.');
    }

    // Step 2: Get pending registration data
    const pending = JSON.parse(localStorage.getItem('pending_registration') || '{}');
    const { username, mobile, county, subcounty, ward, polling_centre } = pending;

    if (!username || !mobile || !county || !subcounty || !ward || !polling_centre) {
      return setInfo('❌ Incomplete registration data.');
    }

    // Step 3: Check if already registered
    const { data: existing } = await supabase
      .from('voter')
      .select('id')
      .or(`username.eq.${username},mobile.eq.${mobile},email.eq.${email}`)
      .maybeSingle();

    if (existing) {
      return setInfo('❌ Already registered.');
    }

    // Step 4: Create voter hash
    const voterHash = sha256(`${email}:${mobile}:${username}`).toString();

    // Step 5: Insert voter
    const { error: insertError } = await supabase.from('voter').insert([{
      username,
      email: null,
      mobile: null,
      county,
      subcounty,
      ward,
      polling_centre,
      voter_hash: voterHash,
      status: 'verified',
    }]);

    if (insertError) {
      console.error('Insert error:', insertError);
      return setInfo('❌ Failed to save voter record.');
    }

    // Step 6: Mark OTP used
    await supabase
      .from('otp_verification')
      .update({ used: true })
      .eq('id', match.id);

    // Step 7: Clean up and redirect
    localStorage.removeItem('pending_registration');
    setInfo('✅ Verified! Redirecting...');
    setTimeout(() => router.push('/dashboard'), 1500);
  };

  return (
    <div style={{ maxWidth: 480, margin: '4rem auto', padding: 24, textAlign: 'center', border: '1px solid #ddd', borderRadius: 10 }}>
      <h2>Enter OTP</h2>
      <p>We've sent a 6-digit code to <strong>{email}</strong>.</p>
      <form onSubmit={handleVerify}>
        <input
          type="text"
          placeholder="Enter 6-digit OTP"
          maxLength={6}
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/, ''))}
          style={{ padding: 12, width: '80%', fontSize: 18, textAlign: 'center', marginTop: 20 }}
          required
        />
        <br />
        <button type="submit" style={{ padding: '10px 20px', marginTop: 20, fontWeight: 'bold' }}>
          Verify
        </button>
        {info && <p style={{ marginTop: 20 }}>{info}</p>}
      </form>
    </div>
  );
}
