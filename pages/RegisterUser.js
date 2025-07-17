import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../utils/supabaseClient';
import CryptoJS from 'crypto-js';

export default function RegisterUser() {
  const router = useRouter();
  const [counties, setCounties] = useState([]);
  const [subcounties, setSubcounties] = useState([]);
  const [wards, setWards] = useState([]);
  const [pollingCenters, setPollingCenters] = useState([]);
  const [form, setForm] = useState({
    name: '',
    email: '',
    mobile: '',
    county: '',
    subcounty: '',
    ward: '',
    pollingCenter: '',
  });
  const [info, setInfo] = useState('');
  const [resendCount, setResendCount] = useState(0);
  const [resendBlocked, setResendBlocked] = useState(false);

  useEffect(() => {
    fetchCounties();
  }, []);

  const fetchCounties = async () => {
    const { data, error } = await supabase.from('counties').select();
    if (!error) setCounties(data);
  };

  useEffect(() => {
    if (form.county) {
      supabase
        .from('subcounties')
        .select()
        .eq('county_code', form.county)
        .then(({ data }) => setSubcounties(data || []));
    }
  }, [form.county]);

  useEffect(() => {
    if (form.subcounty) {
      supabase
        .from('wards')
        .select()
        .eq('subcounty_code', form.subcounty)
        .then(({ data }) => setWards(data || []));
    }
  }, [form.subcounty]);

  useEffect(() => {
    if (form.ward) {
      supabase
        .from('polling_centres')
        .select()
        .eq('ward_code', form.ward)
        .then(({ data }) => setPollingCenters(data || []));
    }
  }, [form.ward]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const formatMobile = (mobile) => {
    let clean = mobile.replace(/\D/g, '');
    if (clean.startsWith('0')) return '254' + clean.substring(1);
    if (clean.startsWith('254')) return clean;
    if (clean.length === 9) return '254' + clean;
    return clean;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setInfo('');

    const formattedMobile = formatMobile(form.mobile);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedEmail = CryptoJS.SHA256(form.email.trim()).toString(CryptoJS.enc.Hex);

    const { data: existing } = await supabase
      .from('voter')
      .select('id')
      .or(`email.eq.${form.email.trim()},mobile.eq.${formattedMobile}`)
      .maybeSingle();

    if (existing) {
      return setInfo('This email or mobile is already registered.');
    }

    const { error: insertError } = await supabase.from('voter').insert([
      {
        name: form.name.trim(),
        email: form.email.trim(),
        mobile: formattedMobile,
        county: form.county,
        subcounty: form.subcounty,
        ward: form.ward,
        polling_center: form.pollingCenter,
        username_hash: hashedEmail,
        status: 'pending',
      },
    ]);

    if (insertError) {
      console.error('❌ Insert Error:', insertError);
      return setInfo('❌ Failed to save voter info.');
    }

    const { error: otpError } = await supabase.from('otp_verification').insert([
      {
        email: form.email.trim(),
        otp,
        used: false,
        resend_count: 1,
        last_resend_time: new Date().toISOString(),
      },
    ]);

    if (otpError) {
      console.error('❌ OTP Save Error:', otpError);
      return setInfo('❌ Failed to save OTP code.');
    }

    const { error: mailError } = await supabase.functions.invoke('send-otp-email', {
      body: {
        email: form.email.trim(),
        passcode: otp,
        time: new Date().toLocaleString(),
      },
    });

    if (mailError) {
      console.error('❌ OTP Send Error:', mailError);
      return setInfo('❌ Failed to send OTP email.');
    }

    localStorage.setItem('otpEmail', form.email.trim());
    router.push('/verify');
  };

  const handleResendOTP = async () => {
    const email = form.email.trim();
    const { data, error } = await supabase
      .from('otp_verification')
      .select('*')
      .eq('email', email)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) return setInfo('No OTP record found to resend.');

    if (data.resend_count >= 3) {
      setResendBlocked(true);
      return setInfo('You have reached the maximum number of resend attempts.');
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const { error: updateError } = await supabase
      .from('otp_verification')
      .update({
        otp,
        resend_count: data.resend_count + 1,
        last_resend_time: new Date().toISOString(),
        used: false,
      })
      .eq('email', email);

    if (updateError) {
      console.error('❌ Resend Update Error:', updateError);
      return setInfo('Failed to update OTP for resend.');
    }

    const { error: mailError } = await supabase.functions.invoke('send-otp-email', {
      body: {
        email,
        passcode: otp,
        time: new Date().toLocaleString(),
      },
    });

    if (mailError) {
      console.error('❌ Resend Email Error:', mailError);
      return setInfo('Failed to send OTP email again.');
    }

    setResendCount(data.resend_count + 1);
    setInfo(`✅ OTP resent to ${email}`);
  };

  return (
    <div>
      <h2>Register to Vote</h2>
      <form onSubmit={handleRegister}>
        <input name="name" placeholder="Full Name" required onChange={handleChange} />
        <input name="email" placeholder="Email" required onChange={handleChange} />
        <input name="mobile" placeholder="Mobile" required onChange={handleChange} />

        <select name="county" required onChange={handleChange}>
          <option value="">Select County</option>
          {counties.map((c) => (
            <option key={c.county_code} value={c.county_code}>{c.name}</option>
          ))}
        </select>

        <select name="subcounty" required onChange={handleChange}>
          <option value="">Select Subcounty</option>
          {subcounties.map((sc) => (
            <option key={sc.subcounty_code} value={sc.subcounty_code}>{sc.name}</option>
          ))}
        </select>

        <select name="ward" required onChange={handleChange}>
          <option value="">Select Ward</option>
          {wards.map((w) => (
            <option key={w.ward_code} value={w.ward_code}>{w.name}</option>
          ))}
        </select>

        <select name="pollingCenter" required onChange={handleChange}>
          <option value="">Select Polling Centre</option>
          {pollingCenters.map((p) => (
            <option key={p.name} value={p.name}>{p.name}</option>
          ))}
        </select>

        <button type="submit">Register<
