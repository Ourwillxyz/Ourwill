import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../src/supabaseClient';
import emailjs from 'emailjs-com';

export default function RegisterUser() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: '',
    mobile: '',
    county: '',
    subcounty: '',
    ward: '',
    polling_centre: '',
  });
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const counties = ['Nairobi', 'Mombasa'];
  const subcounties = ['Westlands', 'Kisauni'];
  const wards = ['Parklands', 'Frere Town'];
  const pollingCentres = ['Westlands Primary', 'Kisauni Secondary'];

  const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSendOTP = async () => {
    setLoading(true);
    const { email, mobile } = formData;
    const formattedMobile = mobile.replace(/^0/, '254');

    const { data: existing } = await supabase
      .from('voters')
      .select('id')
      .or(`email.eq.${email},mobile.eq.${formattedMobile}`);

    if (existing.length > 0) {
      setMessage('Email or mobile already registered.');
      setLoading(false);
      return;
    }

    const otpCode = generateOTP();
    const now = new Date().toLocaleString();

    await supabase.from('otp_verification').insert([
      {
        email,
        mobile: formattedMobile,
        otp: otpCode,
        status: 'pending',
        resend_count: 0,
      },
    ]);

    await emailjs.send(
      'service_21itetw',
      'template_ks69v69',
      { email, passcode: otpCode, time: now },
      'OrOyy74P28MfrgPhr'
    );

    setOtpSent(true);
    setMessage('OTP sent to your email.');
    setLoading(false);
  };

  const handleVerifyOTP = async () => {
    setLoading(true);
    const { email, mobile } = formData;
    const formattedMobile = mobile.replace(/^0/, '254');

    const { data, error } = await supabase
      .from('otp_verification')
      .select('*')
      .eq('email', email)
      .eq('mobile', formattedMobile)
      .eq('otp', otp)
      .single();

    if (data) {
      await supabase.from('voters').insert([
        {
          email,
          mobile: formattedMobile,
          county: formData.county,
          subcounty: formData.subcounty,
          ward: formData.ward,
          polling_centre: formData.polling_centre,
        },
      ]);
      setMessage('OTP verified and registration complete.');
      router.push('/dashboard');
    } else {
      setMessage('Invalid OTP.');
    }
    setLoading(false);
  };

  return (
    <div style={styles.background}>
      <div style={styles.container}>
        <h2 style={{ marginBottom: '1rem' }}>Voter Registration</h2>

        <input
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          style={styles.input}
        />
        <input
          name="mobile"
          placeholder="Mobile (e.g. 0712345678)"
          value={formData.mobile}
          onChange={handleChange}
          style={styles.input}
        />
        <select name="county" value={formData.county} onChange={handleChange} style={styles.input}>
          <option value="">Select County</option>
          {counties.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select name="subcounty" value={formData.subcounty} onChange={handleChange} style={styles.input}>
          <option value="">Select Subcounty</option>
          {subcounties.map((sc) => (
            <option key={sc} value={sc}>
              {sc}
            </option>
          ))}
        </select>
        <select name="ward" value={formData.ward} onChange={handleChange} style={styles.input}>
          <option value="">Select Ward</option>
          {wards.map((w) => (
            <option key={w} value={w}>
              {w}
            </option>
          ))}
        </select>
        <select
          name="polling_centre"
          value={formData.polling_centre}
          onChange={handleChange}
          style={styles.input}
        >
          <option value="">Select Polling Centre</option>
          {pollingCentres.map((pc) => (
            <option key={pc} value={pc}>
              {pc}
            </option>
          ))}
        </select>

        {!otpSent ? (
          <button onClick={handleSendOTP} style={styles.button} disabled={loading}>
            {loading ? 'Sending OTP...' : 'Register'}
          </button>
        ) : (
          <>
            <input
              name="otp"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              style={styles.input}
            />
            <button onClick={handleVerifyOTP} style={styles.button} disabled={loading}>
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
          </>
        )}

        {message && <p style={{ marginTop: '1rem' }}>{message}</p>}
      </div>
    </div>
  );
}

const styles = {
  background: {
    backgroundImage: "url('/kenya-flag.png')",
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    opacity: 0.95,
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    padding: '2rem',
    borderRadius: '12px',
    maxWidth: '400px',
    width: '90%',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
  },
  input: {
    width: '100%',
    padding: '0.6rem',
    marginBottom: '1rem',
    borderRadius: '6px',
    border: '1px solid #ccc',
  },
  button: {
    width: '100%',
    padding: '0.8rem',
    backgroundColor: '#006400',
    color: 'white',
    fontWeight: 'bold',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
  },
};
