// pages/verify.js
import { useState } from 'react';
import { supabase } from '../src/supabaseClient';
import sha256 from 'crypto-js/sha256';

export default function Verify() {
  const [otp, setOtp] = useState('');
  const [info, setInfo] = useState('');

  const handleVerify = async () => {
    setInfo('⏳ Verifying OTP...');

    // Step 1: Get pending data
    const pending = JSON.parse(localStorage.getItem('pending_registration') || '{}');
    const { email, username, mobile, county, subcounty, ward, polling_centre } = pending;

    if (!email || !username || !mobile) {
      return setInfo('❌ Missing registration details. Please register again.');
    }

    // Step 2: Check OTP
    const { data: otpRecord, error: otpError } = await supabase
      .from('otp_verification')
      .select('*')
      .eq('email', email)
      .eq('otp', otp)
      .eq('used', false)
      .maybeSingle();

    if (otpError || !otpRecord) {
      return setInfo('❌ Invalid or expired OTP.');
    }

    // Step 3: Save voter
    const voter_hash = sha256(`${email}:${mobile}:${username}`).toString();

    const { error: insertError } = await supabase.from('voter').insert([
      {
        username,
        email: null, // email not stored to protect privacy
        mobile: null, // mobile not stored
        county,
        subcounty,
        ward,
        polling_centre,
        voter_hash,
        status: 'verified'
      }
    ]);

    if (insertError) {
      console.error('❌ Insert error:', insertError);
      return setInfo('❌ Failed to save voter record.');
    }

    // Step 4: Mark OTP as used
    await supabase.from('otp_verification')
      .update({ used: true })
      .eq('id', otpRecord.id);

    // Step 5: Clear and redirect
    localStorage.removeItem('pending_registration');
    setInfo('✅ OTP verified and registration complete! Redirecting...');
    setTimeout(() => window.location.href = '/dashboard', 2000);
  };

  return (
    <div style={{ maxWidth: 440, margin: '4rem auto', textAlign: 'center' }}>
      <h2>Enter OTP</h2>
      <input
        type="text"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        placeholder="6-digit code"
        maxLength={6}
        style={{ padding: 12, width: '80%', fontSize: 18, marginTop: 10 }}
      />
      <br />
      <button onClick={handleVerify} style={{ marginTop: 20, padding: '10px 20px', fontWeight: 'bold' }}>
        Verify
      </button>
      {info && <p style={{ marginTop: 20, color: info.startsWith('✅') ? 'green' : info.startsWith('❌') ? 'red' : '#333' }}>{info}</p>}
    </div>
  );
}
