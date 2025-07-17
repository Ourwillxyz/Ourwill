import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import emailjs from 'emailjs-com';
import { supabase } from '../utils/supabaseClient';

export default function RegisterUser() {
  const router = useRouter();

  const [counties, setCounties] = useState([]);
  const [subcounties, setSubcounties] = useState([]);
  const [wards, setWards] = useState([]);
  const [pollingCentres, setPollingCentres] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    county_code: '',
    subcounty_code: '',
    ward_code: '',
    polling_centre: '',
  });

  const [info, setInfo] = useState('');
  const [resendCount, setResendCount] = useState(0);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchCounties();
  }, []);

  useEffect(() => {
    if (formData.county_code) {
      fetchSubcounties(formData.county_code);
    }
  }, [formData.county_code]);

  useEffect(() => {
    if (formData.subcounty_code) {
      fetchWards(formData.subcounty_code);
    }
  }, [formData.subcounty_code]);

  useEffect(() => {
    if (formData.ward_code) {
      fetchPollingCentres(formData.ward_code);
    }
  }, [formData.ward_code]);

  const fetchCounties = async () => {
    const { data, error } = await supabase.from('counties').select();
    if (data) setCounties(data);
  };

  const fetchSubcounties = async (county_code) => {
    const { data, error } = await supabase
      .from('subcounties')
      .select()
      .eq('county_code', county_code);
    if (data) setSubcounties(data);
  };

  const fetchWards = async (subcounty_code) => {
    const { data, error } = await supabase
      .from('wards')
      .select()
      .eq('subcounty_code', subcounty_code);
    if (data) setWards(data);
  };

  const fetchPollingCentres = async (ward_code) => {
    const { data, error } = await supabase
      .from('polling_centres')
      .select()
      .eq('ward_code', ward_code);
    if (data) setPollingCentres(data);
  };

  const formatMobile = (mobile) => {
    let cleaned = mobile.replace(/\D/g, '');
    if (cleaned.startsWith('0')) cleaned = '254' + cleaned.substring(1);
    if (!cleaned.startsWith('254')) cleaned = '254' + cleaned;
    return cleaned;
  };

  const sendOtp = async (email, otp) => {
    const now = new Date().toLocaleString();
    return await emailjs.send(
      'service_21itetw',
      'template_ks69v69',
      { email, passcode: otp, time: now },
      'OrOyy74P28MfrgPhr'
    );
  };

  const handleRegister = async () => {
    setSending(true);
    setInfo('');

    const mobileFormatted = formatMobile(formData.mobile);

    const { data: existing } = await supabase
      .from('voter')
      .select('id')
      .or(`email.eq.${formData.email},mobile.eq.${mobileFormatted}`);

    if (existing.length > 0) {
      setInfo('⚠️ A user with this email or mobile already exists.');
      setSending(false);
      return;
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const { error: otpError } = await supabase.from('otp_verification').insert([
      {
        email: formData.email.trim(),
        otp,
        used: false,
      },
    ]);

    if (otpError) {
      console.error('❌ OTP Save Error:', otpError);
      setInfo('❌ Failed to save OTP code.');
      setSending(false);
      return;
    }

    try {
      await sendOtp(formData.email, otp);
      sessionStorage.setItem('registrationData', JSON.stringify({ ...formData, mobile: mobileFormatted }));
      router.push('/verify');
    } catch (error) {
      console.error('❌ EmailJS Error:', error);
      setInfo('❌ Failed to send OTP email.');
    }

    setSending(false);
  };

  const handleResendOtp = async () => {
    if (resendCount >= 3) {
      setInfo('🚫 OTP resend limit reached. Please try again later.');
      return;
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const email = formData.email.trim();

    const { error: otpError } = await supabase.from('otp_verification').insert([
      {
        email,
        otp,
        used: false,
      },
    ]);

    if (otpError) {
      console.error('❌ OTP Resend Save Error:', otpError);
      setInfo('❌ Could not save new OTP code.');
      return;
    }

    try {
      await sendOtp(email, otp);
      setResendCount((prev) => prev + 1);
      if (resendCount === 1) {
        setInfo('⚠️ You have only 1 more OTP resend left.');
      } else if (resendCount === 2) {
        setInfo('🚫 OTP resend limit reached. Further attempts blocked.');
      } else {
        setInfo('✅ OTP resent.');
      }
    } catch (err) {
      console.error('❌ EmailJS Resend Error:', err);
      setInfo('❌ Failed to resend OTP.');
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: 'auto' }}>
      <h2>Register to Vote</h2>
      <input placeholder="Full Name" onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
      <input placeholder="Email" onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
      <input placeholder="Mobile Number" onChange={(e) => setFormData({ ...formData, mobile: e.target.value })} />

      <select onChange={(e) => setFormData({ ...formData, county_code: e.target.value })}>
        <option value="">Select County</option>
        {counties.map((c) => <option key={c.county_code} value={c.county_code}>{c.name}</option>)}
      </select>

      <select onChange={(e) => setFormData({ ...formData, subcounty_code: e.target.value })}>
        <option value="">Select Subcounty</option>
        {subcounties.map((sc) => <option key={sc.subcounty_code} value={sc.subcounty_code}>{sc.name}</option>)}
      </select>

      <select onChange={(e) => setFormData({ ...formData, ward_code: e.target.value })}>
        <option value="">Select Ward</option>
        {wards.map((w) => <option key={w.ward_code} value={w.ward_code}>{w.name}</option>)}
      </select>

      <select onChange={(e) => setFormData({ ...formData, polling_centre: e.target.value })}>
        <option value="">Select Polling Centre</option>
        {pollingCentres.map((p) => <option key={p.name} value={p.name}>{p.name}</option>)}
      </select>

      <br />
      <button disabled={sending} onClick={handleRegister}>
        {sending ? 'Registering...' : 'Register'}
      </button>
      <button disabled={sending || resendCount >= 3} onClick={handleResendOtp} style={{ marginLeft: '10px' }}>
        Resend OTP
      </button>

      <p>{info}</p>
    </div>
  );
}
