// pages/RegisterUser.js
import { useState, useEffect } from 'react';
import { supabase } from '../src/supabaseClient';
import emailjs from 'emailjs-com';
import Image from 'next/image';
import logo from '../public/ourwill-logo.png';

const RegisterUser = () => {
  const [counties, setCounties] = useState([]);
  const [subcounties, setSubcounties] = useState([]);
  const [wards, setWards] = useState([]);
  const [pollingCentres, setPollingCentres] = useState([]);

  const [selectedCounty, setSelectedCounty] = useState('');
  const [selectedSubcounty, setSelectedSubcounty] = useState('');
  const [selectedWard, setSelectedWard] = useState('');
  const [selectedPollingCentre, setSelectedPollingCentre] = useState('');

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [info, setInfo] = useState('');

  useEffect(() => {
    const fetchCounties = async () => {
      const { data } = await supabase.from('counties').select('*').order('name');
      setCounties(data || []);
    };
    fetchCounties();
  }, []);

  useEffect(() => {
    const fetchSubcounties = async () => {
      if (!selectedCounty) return;
      const { data } = await supabase.from('subcounties').select('*').eq('county_code', selectedCounty).order('name');
      setSubcounties(data || []);
    };
    setSubcounties([]);
    setWards([]);
    setPollingCentres([]);
    if (selectedCounty) fetchSubcounties();
  }, [selectedCounty]);

  useEffect(() => {
    const fetchWards = async () => {
      if (!selectedSubcounty) return;
      const { data } = await supabase.from('wards').select('*').eq('subcounty_code', selectedSubcounty).order('name');
      setWards(data || []);
    };
    setWards([]);
    setPollingCentres([]);
    if (selectedSubcounty) fetchWards();
  }, [selectedSubcounty]);

  useEffect(() => {
    const fetchPolling = async () => {
      if (!selectedWard) return;
      const { data } = await supabase.from('polling_centres').select('*').eq('ward_code', selectedWard).order('name');
      setPollingCentres(data || []);
    };
    setPollingCentres([]);
    if (selectedWard) fetchPolling();
  }, [selectedWard]);

  const checkUniqueness = async () => {
    const usernameHash = sha256(username.trim()).toString();
    const emailHash = sha256(email.trim().toLowerCase()).toString();
    const mobileHash = sha256(`254${mobile.trim()}`).toString();

    const { data } = await supabase
      .from('voter')
      .select('id')
      .or(`email_hash.eq.${emailHash},mobile_hash.eq.${mobileHash},username_hash.eq.${usernameHash}`);
    return data || [];
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!username || !email || !mobile || !selectedCounty || !selectedSubcounty || !selectedWard || !selectedPollingCentre) {
      return setInfo('❌ Please complete all fields.');
    }

    const formattedMobile = `254${mobile.trim()}`;
    const existing = await checkUniqueness();
    if (existing.length > 0) return setInfo('❌ Email, mobile, or username already registered.');

    // Check for resend limit
    const { data: recentOtps } = await supabase
      .from('otp_verification')
      .select('created_at')
      .eq('email', email.trim().toLowerCase())
      .order('created_at', { ascending: false });

    const now = new Date();
    const otpsLastHour = (recentOtps || []).filter(
      (r) => new Date(r.created_at) > new Date(now.getTime() - 60 * 60 * 1000)
    );

    if (otpsLastHour.length >= 3) {
      return setInfo('❌ OTP request limit exceeded. Please try again after 1 hour.');
    } else if (otpsLastHour.length >= 2) {
      setInfo('⚠️ Warning: You are about to exceed OTP request limit.');
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const { error: otpError } = await supabase.from('otp_verification').insert([{
      email: email.trim().toLowerCase(),
      otp,
      used: false
    }]);

    if (otpError) {
      console.error(otpError);
      return setInfo('❌ Failed to save OTP code.');
    }

    try {
      await emailjs.send('service_21itetw', 'template_ks69v69', {
        email,
        passcode: otp,
        time: new Date().toLocaleString(),
      }, 'OrOyy74P28MfrgPhr');

      localStorage.setItem('pending_registration', JSON.stringify({
        username,
        email: email.trim(),
        mobile: formattedMobile,
        county: selectedCounty,
        subcounty: selectedSubcounty,
        ward: selectedWard,
        polling_centre: selectedPollingCentre
      }));

      setInfo('✅ OTP sent to your email. Redirecting...');
      setTimeout(() => window.location.href = '/verify', 1500);
    } catch (err) {
      console.error('❌ EmailJS Error:', err);
      setInfo('❌ Failed to send OTP email.');
    }
  };

  return (
    <div style={{ maxWidth: 540, margin: '2rem auto', padding: 24, border: '1px solid #ddd', borderRadius: 10, background: '#fff' }}>
      <Image src={logo} alt="OurWill Logo" width={140} />
      <form onSubmit={handleRegister}>
        <input type="text" placeholder="Unique Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
        <input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="tel" placeholder="Mobile (712345678)" value={mobile} onChange={(e) => setMobile(e.target.value.replace(/\D/, ''))} maxLength={9} required />

        <select value={selectedCounty} onChange={(e) => setSelectedCounty(e.target.value)} required>
          <option value="">-- Select County --</option>
          {counties.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
        </select>

        <select value={selectedSubcounty} onChange={(e) => setSelectedSubcounty(e.target.value)} required disabled={!selectedCounty}>
          <option value="">-- Select Subcounty --</option>
          {subcounties.map((s) => <option key={s.code} value={s.code}>{s.name}</option>)}
        </select>

        <select value={selectedWard} onChange={(e) => setSelectedWard(e.target.value)} required disabled={!selectedSubcounty}>
          <option value="">-- Select Ward --</option>
          {wards.map((w) => <option key={w.code} value={w.code}>{w.name}</option>)}
        </select>

        <select value={selectedPollingCentre} onChange={(e) => setSelectedPollingCentre(e.target.value)} required disabled={!selectedWard}>
          <option value="">-- Select Polling Centre --</option>
          {pollingCentres.map((p) => <option key={p.id} value={p.name}>{p.name}</option>)}
        </select>

        <button type="submit">Register</button>
        {info && <p style={{ marginTop: 20, color: info.startsWith('✅') ? 'green' : info.startsWith('❌') ? 'red' : 'orange' }}>{info}</p>}
      </form>
    </div>
  );
};

export default RegisterUser;
