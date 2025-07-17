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
      const { data } = await supabase
        .from('subcounties')
        .select('*')
        .eq('county_code', selectedCounty)
        .order('name');
      setSubcounties(data || []);
    };
    setSelectedSubcounty('');
    setSelectedWard('');
    setSelectedPollingCentre('');
    setSubcounties([]);
    setWards([]);
    setPollingCentres([]);
    if (selectedCounty) fetchSubcounties();
  }, [selectedCounty]);

  useEffect(() => {
    const fetchWards = async () => {
      if (!selectedSubcounty) return;
      const { data } = await supabase
        .from('wards')
        .select('*')
        .eq('subcounty_code', selectedSubcounty)
        .order('name');
      setWards(data || []);
    };
    setSelectedWard('');
    setSelectedPollingCentre('');
    setWards([]);
    setPollingCentres([]);
    if (selectedSubcounty) fetchWards();
  }, [selectedSubcounty]);

  useEffect(() => {
    const fetchPolling = async () => {
      if (!selectedWard) return;
      const { data } = await supabase
        .from('polling_centres')
        .select('*')
        .eq('ward_code', selectedWard)
        .order('name');
      setPollingCentres(data || []);
    };
    setSelectedPollingCentre('');
    setPollingCentres([]);
    if (selectedWard) fetchPolling();
  }, [selectedWard]);

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!username.trim()) return setInfo('❌ Please enter a username.');
    if (!/\S+@\S+\.\S+/.test(email)) return setInfo('❌ Please enter a valid email.');
    if (!/^\d{9}$/.test(mobile)) return setInfo('❌ Enter a valid 9-digit mobile number.');
    if (!selectedCounty || !selectedSubcounty || !selectedWard || !selectedPollingCentre) {
      return setInfo('❌ Please select your full location.');
    }

    const fullMobile = `254${mobile}`;
    setInfo('⏳ Checking credentials...');

    // Check if user already exists
    const { data: existingUser, error } = await supabase
      .from('users')
      .select('email, username, mobile')
      .or(`email.eq.${email},username.eq.${username},mobile.eq.${fullMobile}`);

    if (existingUser && existingUser.length > 0) {
      return setInfo('❌ Email, username, or mobile already registered.');
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const { error: otpError } = await supabase.from('otp_verification').insert([
      { email, otp, used: false }
    ]);

    if (otpError) {
      console.error('❌ OTP Save Error:', otpError);
      return setInfo('❌ Failed to save OTP code.');
    }

    try {
      const now = new Date().toLocaleString();
      await emailjs.send(
        'service_21itetw',
        'template_ks69v69',
        { email, passcode: otp, time: now },
        'OrOyy74P28MfrgPhr'
      );

      localStorage.setItem('pending_registration', JSON.stringify({
        email,
        username,
        mobile: fullMobile,
        county: selectedCounty,
        subcounty: selectedSubcounty,
        ward: selectedWard,
        polling_centre: selectedPollingCentre
      }));

      setInfo('✅ OTP sent. Redirecting to verify...');
      setTimeout(() => {
        window.location.href = '/verify';
      }, 1500);
    } catch (err) {
      console.error('❌ EmailJS error:', err);
      setInfo('❌ Failed to send OTP email.');
    }
  };

  return (
    <div style={{ maxWidth: 540, margin: '2rem auto', padding: 24, border: '1px solid #ddd', borderRadius: 10 }}>
      <Image src={logo} alt="OurWill Logo" width={140} />
      <form onSubmit={handleRegister} style={{ marginTop: 16 }}>
        <input
          type="text"
          placeholder="Unique Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          style={inputStyle}
        />
        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={inputStyle}
        />
        <input
          type="tel"
          placeholder="Mobile (712345678)"
          value={mobile}
          onChange={(e) => setMobile(e.target.value.replace(/\D/, ''))}
          maxLength={9}
          required
          style={inputStyle}
        />

        <select value={selectedCounty} onChange={(e) => setSelectedCounty(e.target.value)} required style={inputStyle}>
          <option value="">-- Select County --</option>
          {counties.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
        </select>

        <select
          value={selectedSubcounty}
          onChange={(e) => setSelectedSubcounty(e.target.value)}
          required
          disabled={!selectedCounty}
          style={inputStyle}
        >
          <option value="">-- Select Subcounty --</option>
          {subcounties.map((s) => <option key={s.code} value={s.code}>{s.name}</option>)}
        </select>

        <select
          value={selectedWard}
          onChange={(e) => setSelectedWard(e.target.value)}
          required
          disabled={!selectedSubcounty}
          style={inputStyle}
        >
          <option value="">-- Select Ward --</option>
          {wards.map((w) => <option key={w.code} value={w.code}>{w.name}</option>)}
        </select>

        <select
          value={selectedPollingCentre}
          onChange={(e) => setSelectedPollingCentre(e.target.value)}
          required
          disabled={!selectedWard}
          style={inputStyle}
        >
          <option value="">-- Select Polling Centre --</option>
          {pollingCentres.map((p) => <option key={p.id} value={p.name}>{p.name}</option>)}
        </select>

        <button type="submit" style={{ marginTop: 24, padding: '10px 20px', fontWeight: 'bold' }}>
          Register & Send OTP
        </button>
        {info && <p style={{ marginTop: 16, color: info.startsWith('✅') ? 'green' : 'red' }}>{info}</p>}
      </form>
    </div>
  );
};

const inputStyle = {
  width: '90%', padding: 10, margin: '10px 0'
};

export default RegisterUser;
