// pages/verify.js
import { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../src/supabaseClient';
import sha256 from 'crypto-js/sha256';

const VerifyOTP = () => {
  const router = useRouter();
  const [otpInput, setOtpInput] = useState('');
  const [info, setInfo] = useState('');

  const handleVerify = async (e) => {
    e.preventDefault();
    setInfo('⏳ Verifying OTP...');

    const pending = JSON.parse(localStorage.getItem('pending_registration') || '{}');
    const { email, username, mobile, county, subcounty, ward, polling_centre } = pending;

    if (!otpInput || !email || !username || !mobile) {
      return setInfo('❌ Missing information or OTP.');
    }

    const { data: otpRecord, error: fetchError } = await supabase
      .from('otp_verification')
      .select('*')
      .eq('email', email)
      .eq('otp', otpInput)
      .eq('used', false)
      .maybeSingle();

    if (fetchError || !otpRecord) {
      return setInfo('❌ Invalid or expired OTP.');
    }

    // Mark OTP as used
    await supabase
      .from('otp_verification')
      .update({ used: true })
      .eq('id', otpRecord.id);

    // Check again for duplicate voter
    const { data: duplicate } = await supabase
      .from('voter')
      .select('id')
      .or(`email.eq.${email},mobile.eq.${mobile},username.eq.${username}`)
      .maybeSingle();

    if (duplicate) {
      return setInfo('❌ This voter is already registered.');
    }

    const voterHash = sha256(`${email}:${mobile}:${username}`).toString();

    const { error: saveError } = await supabase.from('voter').insert([{
      email: null,
      mobile: null,
      username,
      county,
      subcounty,
      ward,
      polling_centre,
      voter_hash: voterHash,
      status: 'verified',
    }]);

    if (saveError) {
      console.error('Voter insert error:', saveError);
      return setInfo('❌ Failed to save voter.');
    }

    localStorage.removeItem('pending_registration');
    setInfo('✅ Registration complete! Redirecting...');
    setTimeout(() => router.push('/dashboard'), 2000);
  };

  return (
    <div style={{ maxWidth: 480, margin: '2rem auto', textAlign: 'center', padding: '2rem', border: '1px solid #ccc', borderRadius: '10px' }}>
      <h2>🔒 Verify Your Email</h2>
      <p>Enter the 6-digit OTP sent to your email.</p>
      <form onSubmit={handleVerify} style={{ marginTop: '1rem' }}>
        <input
          type="text"
          value={otpInput}
          onChange={(e) => setOtpInput(e.target.value.replace(/\D/, ''))}
          maxLength={6}
          placeholder="Enter OTP"
          required
          style={{ padding: '10px', fontSize: '1rem', width: '70%', textAlign: 'center' }}
        />
        <br />
        <button type="submit" style={{ marginTop: '1rem', padding: '10px 20px', fontWeight: 'bold' }}>
          Verify OTP
        </button>
        {info && <p style={{ marginTop: 20, color: info.startsWith('✅') ? 'green' : info.startsWith('❌') ? 'red' : '#333' }}>{info}</p>}
      </form>
    </div>
  );
};

export default VerifyOTP;
