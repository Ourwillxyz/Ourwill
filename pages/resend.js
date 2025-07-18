import { useState } from 'react';
import { supabase } from '../src/supabaseClient';
import emailjs from '@emailjs/browser';

export default function ResendOTP() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleResend = async (e) => {
    e.preventDefault();

    if (!/\S+@\S+\.\S+/.test(email)) {
      return setMessage('❌ Enter a valid email address.');
    }

    setMessage('⏳ Checking OTP records...');

    // Step 1: Look for an existing, unused OTP
    const { data: existingOtp } = await supabase
      .from('otp_verification')
      .select('*')
      .eq('email', email.trim())
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
        return setMessage('❌ Failed to create a new OTP.');
      }
    }

    // Step 2: Send email via EmailJS
    try {
      const now = new Date().toLocaleString();
      await emailjs.send(
        'service_21itetw',     // ✅ Your actual service ID
        'template_ks69v69',    // ✅ Your actual template ID
        {
          email,
          passcode: otp,
          time: now,
        },
        'OrOyy74P28MfrgPhr'     // ✅ Your actual public key
      );

      setMessage('✅ OTP has been resent to your email.');
    } catch (err) {
      console.error('EmailJS Error:', err);
      setMessage('❌ Failed to send email. Please try again.');
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: '5rem auto', padding: 24, border: '1px solid #ccc', borderRadius: 8 }}>
      <h2>Resend OTP</h2>
      <form onSubmit={handleResend} style={{ marginTop: 20 }}>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: '100%', padding: 10 }}
        />
        <button type="submit" style={{ marginTop: 16, padding: '10px 20px' }}>Resend</button>
      </form>
      {message && <p style={{ marginTop: 20, color: message.startsWith('✅') ? 'green' : 'red' }}>{message}</p>}
    </div>
  );
}
