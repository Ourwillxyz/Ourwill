import { useEffect, useState } from 'react';
import { supabase } from '../src/supabaseClient';
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
    polling_centre: '',
  });

  const [otp, setOtp] = useState('');
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  // Fetch counties on mount
  useEffect(() => {
    const fetchCounties = async () => {
      const { data, error } = await supabase.from('counties').select();
      if (error) {
        alert('Failed to fetch counties');
        return;
      }
      setCounties(data || []);
    };
    fetchCounties();
  }, []);

  // Fetch subcounties on county change
  useEffect(() => {
    const fetchSubcounties = async () => {
      if (!formData.county) {
        setSubcounties([]);
        return;
      }
      const { data, error } = await supabase
        .from('subcounties')
        .select()
        .eq('county_code', formData.county);
      if (error) {
        alert('Failed to fetch subcounties');
        return;
      }
      setSubcounties(data || []);
    };
    fetchSubcounties();
  }, [formData.county]);

  // Fetch wards on subcounty change
  useEffect(() => {
    const fetchWards = async () => {
      if (!formData.subcounty) {
        setWards([]);
        return;
      }
      const { data, error } = await supabase
        .from('wards')
        .select()
        .eq('subcounty_code', formData.subcounty);
      if (error) {
        alert('Failed to fetch wards');
        return;
      }
      setWards(data || []);
    };
    fetchWards();
  }, [formData.subcounty]);

  // Fetch polling centres on ward change
  useEffect(() => {
    const fetchPollingCentres = async () => {
      if (!formData.ward) {
        setPollingCentres([]);
        return;
      }
      const { data, error } = await supabase
        .from('polling_centres')
        .select()
        .eq('ward_code', formData.ward);
      if (error) {
        alert('Failed to fetch polling centres');
        return;
      }
      setPollingCentres(data || []);
    };
    fetchPollingCentres();
  }, [formData.ward]);

  // Resend OTP timer
  useEffect(() => {
    if (otpSent && resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else if (resendTimer === 0) {
      setCanResend(true);
    }
  }, [otpSent, resendTimer]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

  const sendOtpEmail = async (email, passcode) => {
    try {
      await emailjs.send(
        'service_21itetw',
        'template_ks69v69',
        { email, passcode },
        'OrOyy74P28MfrgPhr'
      );
      return true;
    } catch (err) {
      alert('Failed to send OTP email');
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const passcode = generateOtp();
    setOtp(passcode);

    // Hash values
    const email_hash = sha256(formData.email).toString();
    const username_hash = sha256(formData.username).toString();
    const mobile_hash = sha256(formData.mobile).toString();
    const voter_hash = sha256(
      formData.username + formData.email + formData.mobile
    ).toString();

    // Store voter
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
        status: 'pending',
      },
    ]);

    if (error) {
      alert('Registration failed: ' + error.message);
      return;
    }

    const sent = await sendOtpEmail(formData.email, passcode);
    if (!sent) return;

    setOtpSent(true);
    setResendTimer(60);
    setCanResend(false);
    alert('OTP sent successfully.');
  };

  const resendOtp = async () => {
    if (!canResend) return;

    const passcode = generateOtp();
    setOtp(passcode);

    const sent = await sendOtpEmail(formData.email, passcode);
    if (!sent) return;

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
        padding: '2rem',
      }}
    >
      <Image src="/logo.png" alt="Logo" width={100} height={100} />
      <h2>Voter Registration</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="Email"
          required
          value={formData.email}
          onChange={handleChange}
        />
        <label htmlFor="mobile">Mobile</label>
        <input
          id="mobile"
          name="mobile"
          type="tel"
          placeholder="Mobile"
          required
          value={formData.mobile}
          onChange={handleChange}
        />
        <label htmlFor="username">Username</label>
        <input
          id="username"
          name="username"
          type="text"
          placeholder="Username"
          required
          value={formData.username}
          onChange={handleChange}
        />
        <label htmlFor="county">County</label>
        <select
          id="county"
          name="county"
          required
          value={formData.county}
          onChange={handleChange}
        >
          <option value="">Select County</option>
          {counties.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name}
            </option>
          ))}
        </select>
        <label htmlFor="subcounty">Subcounty</label>
        <select
          id="subcounty"
          name="subcounty"
          required
          value={formData.subcounty}
          onChange={handleChange}
        >
          <option value="">Select Subcounty</option>
          {subcounties.map((s) => (
            <option key={s.code} value={s.code}>
              {s.name}
            </option>
          ))}
        </select>
        <label htmlFor="ward">Ward</label>
        <select
          id="ward"
          name="ward"
          required
          value={formData.ward}
          onChange={handleChange}
        >
          <option value="">Select Ward</option>
          {wards.map((w) => (
            <option key={w.code} value={w.code}>
              {w.name}
            </option>
          ))}
        </select>
        <label htmlFor="polling_centre">Polling Centre</label>
        <select
          id="polling_centre"
          name="polling_centre"
          required
          value={formData.polling_centre}
          onChange={handleChange}
        >
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
