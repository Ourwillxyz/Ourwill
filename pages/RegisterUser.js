import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import emailjs from '@emailjs/browser';
import sha256 from 'crypto-js/sha256';
import Image from 'next/image';

export default function RegisterUser() {
  const [counties, setCounties] = useState([]);
  const [subcounties, setSubcounties] = useState([]);
  const [wards, setWards] = useState([]);
  const [pollingCentres, setPollingCentres] = useState([]);

  const [formData, setFormData] = useState({
    email: '',
    mobile: '',
    username: '',
    county: '',
    subcounty: '',
    ward: '',
    polling_centre: ''
  });

  const [otp, setOtp] = useState('');
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  useEffect(() => {
    fetchCounties();
  }, []);

  useEffect(() => {
    if (formData.county) fetchSubcounties();
  }, [formData.county]);

  useEffect(() => {
    if (formData.subcounty) fetchWards();
  }, [formData.subcounty]);

  useEffect(() => {
    if (formData.ward) fetchPollingCentres();
  }, [formData.ward]);

  useEffect(() => {
    let timer;
    if (otpSent && resendTimer > 0) {
      timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    } else if (resendTimer === 0) {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [otpSent, resendTimer]);

  const fetchCounties = async () => {
    const { data, error } = await supabase.from('counties').select();
    if (data) setCounties(data);
  };

  const fetchSubcounties = async () => {
    const { data } = await supabase
      .from('subcounties')
      .select()
      .eq('county_code', formData.county);
    if (data) setSubcounties(data);
  };

  const fetchWards = async () => {
    const { data } = await supabase
      .from('wards')
      .select()
      .eq('subcounty_code', formData.subcounty);
    if (data) setWards(data);
  };

  const fetchPollingCentres = async () => {
    const { data } = await supabase
      .from('polling_centres')
      .select()
      .eq('ward_code', formData.ward);
    if (data) setPollingCentres(data);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const passcode = Math.floor(100000 + Math.random() * 900000).toString();
    setOtp(passcode);

    const email_hash = sha256(formData.email).toString();
    const username_hash = sha256(formData.username).toString();
    const mobile_hash = sha256(formData.mobile).toString();
    const voter_hash = sha256(
      formData.username + formData.email + formData.mobile
    ).toString();

    const { error } = await supabase.from('voter').insert([
      {
        email: formData.email,
        mobile: formData.mobile,
        username: formData.username,
        county: formData.county,
        subcounty: formData.subcounty,
        ward: formData.ward,
        polling_centre: formData.polling_centre,
        email_hash,
        username_hash,
        mobile_hash,
        voter_hash,
        status: 'pending'
      }
    ]);

    if (error) {
      alert('Registration failed: ' + error.message);
      return;
    }

    await emailjs.send(
      'service_21itetw',
      'template_ks69v69',
      {
        email: formData.email,
        passcode: passcode
      },
      'OrOyy74P28MfrgPhr'
    );

    setOtpSent(true);
    setResendTimer(60);
    setCanResend(false);
    alert('OTP sent successfully.');
  };

  const resendOtp = async () => {
    if (!canResend) return;

    const passcode = Math.floor(100000 + Math.random() * 900000).toString();
    setOtp(passcode);

    await emailjs.send(
      'service_21itetw',
      'template_ks69v69',
      {
        email: formData.email,
        passcode: passcode
      },
      'OrOyy74P28MfrgPhr'
    );

    setResendTimer(60);
    setCanResend(false);
    setOtpSent(true);
    alert('OTP resent successfully.');
  };

  return (
    <div
      style={{
        backgroundImage: 'url("/flag.png")',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'contain',
        backgroundPosition: 'center',
        minHeight: '100vh',
        padding: '2rem'
      }}
    >
      <Image src="/logo.png" alt="Logo" width={100} height={100} />
      <h2>Voter Registration</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="email"
          type="email"
          placeholder="Email"
          required
          value={formData.email}
          onChange={handleChange}
        />
        <input
          name="mobile"
          type="tel"
          placeholder="Mobile"
          required
          value={formData.mobile}
          onChange={handleChange}
        />
        <input
          name="username"
          type="text"
          placeholder="Username"
          required
          value={formData.username}
          onChange={handleChange}
        />
        <select name="county" required onChange={handleChange}>
          <option value="">Select County</option>
          {counties.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name}
            </option>
          ))}
        </select>
        <select name="subcounty" required onChange={handleChange}>
          <option value="">Select Subcounty</option>
          {subcounties.map((s) => (
            <option key={s.code} value={s.code}>
              {s.name}
            </option>
          ))}
        </select>
        <select name="ward" required onChange={handleChange}>
          <option value="">Select Ward</option>
          {wards.map((w) => (
            <option key={w.code} value={w.code}>
              {w.name}
            </option>
          ))}
        </select>
        <select name="polling_centre" required onChange={handleChange}>
          <option value="">Select Polling Centre</option>
          {pollingCentres.map((p) => (
            <option key={p.code} value={p.code}>
              {p.name}
            </option>
          ))}
        </select>

        <button type="submit">Register</button>
      </form>

      {otpSent && (
        <div style={{ marginTop: '1rem' }}>
          <p>OTP sent to your email.</p>
          <button onClick={resendOtp} disabled={!canResend}>
            {canResend ? 'Resend OTP' : `Resend in ${resendTimer}s`}
          </button>
        </div>
      )}
    </div>
  );
}
