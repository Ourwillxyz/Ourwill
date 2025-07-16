// pages/verify.js
import { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../src/supabaseClient';
import sha256 from 'crypto-js/sha256';

export default function Verify() {
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleVerify = async (e) => {
    e.preventDefault();

    if (!/^\d{6}$/.test(otp)) {
      return setMessage('❌ Please enter a valid 6-digit OTP code.');
    }

    setMessage('⏳ Verifying OTP...');

    // Step 1: Look up the OTP
    const { data: otpRecord, error: otpError } = await supabase
      .from('otp_verification')
      .select('*')
      .eq('otp', otp)
      .eq('used', false)
      .maybeSingle();

    if (otpError || !otpRecord) {
      return setMessage('❌ Invalid or expired OTP.');
    }

    const email = otpRecord.email;

    // Step 2: Get pending registration data
    const pending = JSON.parse(localStorage.getItem('pending_registration') || '{}');
    const { username, mobile, county, subcounty, ward, polling_centre } = pending;

    if (!email || !username || !mobile || !county || !subcounty || !ward || !polling_centre) {
      return setMessage('❌ Registration data missing. Please restart registration.');
    }

    const emailHash = sha256(email.trim().toLowerCase()).toString();
    const mobileHash = sha256(mobile).toString();
    const usernameHash = sha256(username.trim().toLowerCase()).toString();
    const voterHash = sha256(`${email}:${mobile}:${username}`).toString();

    // Step 3: Insert voter record
    const { error: insertError } = await supabase.from('voter').insert([
      {
        email_hash: emailHash,
        mobile_hash: mobileHash,
        username_hash: usernameHash,
        county,
        subcounty,
        ward,
        polling_centre,
        voter_hash: voterHash,
        status: 'verified'
      }
    ]);

    if (insertError) {
      console.error('Insert Error:', insertError);
      return setMessage('❌ Could not save voter. Contact support.');
    }

    // Step 4: Mark OTP as used
    await supabase
      .from('otp_verification')
      .update({ used: true })
      .eq('id', otpRecord.id);

    localStorage.removeItem('pending_registration');
    setMessage('✅ Verification complete! Redirecting...');

    setTimeout(() => {
      router.push('/dashboard');
    }, 1500);
  };

  return (
    <div style={{ maxWidth: 440, margin: '5rem auto', padding: 20, border: '1px solid #ccc', borderRadius: 10, textAlign: 'center' }}>
      <h2>Enter Your OTP</h2>
      <form onSubmit={handleVerify}>
        <input
          type="text"
          placeholder="6-digit code"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/, ''))}
          maxLength={6}
          required
          style={{ width: '80%', padding: 10, marginTop: 16 }}
        />
        <button type="submit" style={{ marginTop: 16, padding: '10px 20px' }}>Verify</button>
      </form>
      {message && <p style={{ marginTop: 20, color: message.startsWith('✅') ? 'green' : 'red' }}>{message}</p>}
    </div>
  );
}
