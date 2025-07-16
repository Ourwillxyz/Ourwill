// pages/verify.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../src/supabaseClient';
import sha256 from 'crypto-js/sha256';
import emailjs from 'emailjs-com';

export default function Verify() {
  const [otpInput, setOtpInput] = useState('');
  const [info, setInfo] = useState('');
  const [email, setEmail] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [resending, setResending] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('pending_registration') || '{}');
    if (stored.email) setEmail(stored.email);

    // Countdown for resend OTP
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleVerify = async (e) => {
    e.preventDefault();

    if (!otpInput.trim()) return setInfo('❌ Please enter your OTP.');
    if (!email) return setInfo('❌ Missing email context.');

    setInfo('⏳ Verifying OTP...');

    // Step 1: Look up OTP
    const { data: match, error } = await supabase
      .from('otp_verification')
      .select('*')
      .eq('email', email)
      .eq('otp', otpInput.trim())
      .eq('used', false)
      .maybeSingle();

    if (!match || error) {
      return setInfo('❌ Invalid or expired OTP.');
    }

    // Step 2: Mark OTP as used
    await supabase
      .from('otp_verification')
      .update({ used: true })
      .eq('id', match.id);

    // Step 3: Retrieve registration details
    const pending = JSON.parse(localStorage.getItem('pending_registration') || '{}');
    const { username, mobile, county, subcounty, ward, polling_centre } = pending;

    if (!username || !mobile || !county || !subcounty || !ward || !polling_centre) {
      return setInfo('❌ Incomplete registration data.');
    }

    // Step 4: Generate hashes for privacy
    const voterHash = sha256(`${email}:${mobile}:${username}`).toString();
    const usernameHash = sha256(username).toString();
    const emailHash = sha256(email).toString();
    const mobileHash = sha256(mobile).toString();

    // Step 5: Save voter
    const { error: insertError } = await supabase.from('voter').insert([{
      username,
      email: null,
      mobile: null,
      county,
      subcounty,
      ward,
      polling_centre,
      voter_hash: voterHash,
      username_hash: usernameHash,
      email_hash: emailHash,
      mobile_hash: mobileHash,
      status: 'verified'
    }]);

    if (insertError) {
      console.error('Insert error:', insertError);
      return setInfo('❌ Could not save your record. Contact support.');
    }

    // Step 6: Clean up and redirect
    localStorage.removeItem('pending_registration');
    setInfo('✅ Registration complete! Redirecting...');
    setTimeout(() => router.push('/dashboard'), 2000);
  };

  const handleResendOTP = async () => {
    if (!email) return setInfo('❌ Email missing.');

    if (countdown > 0) {
      return setInfo(`⏳ Please wait ${countdown} seconds before resending OTP.`);
    }

    setResending(true);
    setInfo('⏳ Sending OTP...');

    const { data: existingOtp } = await supabase
      .from('otp_verification')
      .select('*')
      .eq('email', email)
      .eq('used', false)
      .order('created_at', { ascending: false })
      .maybeSingle();

    let otp = '';
    if (existingOtp) {
      otp = existingOtp.otp;
    } else {
      otp = Math.floor(100000 + Math.random() * 900000).toString();
      const { error: insertError } = await supabase
        .from('otp_verification')
        .insert([{ email: email.trim(), otp, used: false }]);
      if (insertError) {
        console.error('OTP Insert Error:', insertError);
        setResending(false);
        return setInfo('❌ Failed to create a new OTP.');
      }
    }

    try {
      const now = new Date().toLocaleString();
      await emailjs.send(
        'service_21itetw',
        'template_ks69v69',
        {
          email,
          passcode: otp,
          time: now,
        },
        'OrOyy74P28MfrgPhr'
      );

      setInfo('✅ OTP sent successfully.');
      setCountdown(60); // Start 60 second timer
    } catch (err) {
      console.error('EmailJS resend error:', err);
      setInfo('❌ Failed to send OTP.');
    }

    setResending(false);
  };

  return (
    <div style={{ maxWidth: 420, margin: '5rem auto', padding: 24, textAlign: 'center', border: '1px solid #ccc', borderRadius: 8 }}>
      <h2>Verify Your OTP</h2>
      <form onSubmit={handleVerify} style={{ marginTop: 20 }}>
        <input
          type="text"
          placeholder="Enter your OTP"
          value={otpInput}
          onChange={(e) => setOtpInput(e.target.value)}
          maxLength={6}
          style={{ width: '100%', padding: 10 }}
        />
        <button type="submit" style={{ marginTop: 16, padding: '10px 20px' }}>Verify</button>
      </form>

      <button
        onClick={handleResendOTP}
        disabled={resending || countdown > 0}
        style={{ marginTop: 20, backgroundColor: '#f0f0f0', padding: '8px 16px', cursor: countdown > 0 ? 'not-allowed' : 'pointer' }}
      >
        {countdown > 0 ? `Wait ${countdown}s to resend` : 'Resend OTP'}
      </button>

      {info && <p style={{ marginTop: 20, color: info.startsWith('✅') ? 'green' : 'red' }}>{info}</p>}
    </div>
  );
}
