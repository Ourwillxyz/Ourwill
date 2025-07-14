import { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../src/supabaseClient';
import sha256 from 'crypto-js/sha256';

export default function Verify() {
  const [otpInput, setOtpInput] = useState('');
  const [info, setInfo] = useState('');
  const router = useRouter();

  const handleVerify = async (e) => {
    e.preventDefault();

    const pending = JSON.parse(localStorage.getItem('pending_registration') || '{}');
    const { email, username, mobile, county, subcounty, ward, polling_centre } = pending;

    if (!email || !username || !mobile || !county || !subcounty || !ward || !polling_centre) {
      return setInfo('❌ Incomplete registration data. Please register again.');
    }

    setInfo('⏳ Verifying OTP...');

    // 1. Look up OTP record
    const { data: otpRecord, error: otpError } = await supabase
      .from('otp_verification')
      .select('*')
      .eq('email', email)
      .eq('otp', otpInput)
      .eq('used', false)
      .gte('expires_at', new Date().toISOString())
      .maybeSingle();

    if (otpError || !otpRecord) {
      return setInfo('❌ Invalid or expired OTP.');
    }

    // 2. Prevent duplicates
    const { data: existing } = await supabase
      .from('voter')
      .select('id')
      .or(`email.eq.${email},mobile.eq.${mobile},username.eq.${username}`)
      .maybeSingle();

    if (existing) {
      return setInfo('❌ Already registered.');
    }

    // 3. Hash voter ID
    const voterHash = sha256(`${email}:${mobile}:${username}`).toString();

    const { error: insertError } = await supabase.from('voter').insert([{
      username,
      email: null,
      mobile: null,
      county,
      subcounty,
      ward,
      polling_centre,
      voter_hash: voterHash,
      status: 'verified'
    }]);

    if (insertError) {
      console.error(insertError);
      return setInfo('❌ Could not save voter data.');
    }

    // 4. Mark OTP as used
    await supabase
      .from('otp_verification')
      .update({ used: true })
      .eq('email', email)
      .eq('otp', otpInput);

    // 5. Clean up and redirect
    localStorage.removeItem('pending_registration');
    setInfo('✅ Verified and registered! Redirecting...');
    setTimeout(() => router.push('/dashboard'), 2000);
  };

  return (
    <div style={{ padding: 40, textAlign: 'center', maxWidth: 480, margin: 'auto' }}>
      <h2>Enter Your OTP</h2>
      <form onSubmit={handleVerify}>
        <input
          type="text"
          placeholder="Enter the 6-digit OTP"
          value={otpInput}
          onChange={(e) => setOtpInput(e.target.value)}
          maxLength={6}
          required
          style={{ padding: 10, width: '80%', marginTop: 20, fontSize: 18 }}
        />
        <br />
        <button type="submit" style={{ marginTop: 20, padding: '10px 20px', fontWeight: 'bold' }}>
          Verify & Complete
        </button>
      </form>
      {info && <p style={{ marginTop: 20, color: info.startsWith('✅') ? 'green' : info.startsWith('❌') ? 'red' : '#333' }}>{info}</p>}
    </div>
  );
}
