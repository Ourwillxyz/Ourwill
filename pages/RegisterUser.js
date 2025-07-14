// pages/RegisterUser.js
import { useState, useEffect } from 'react';
import { supabase } from '../src/supabaseClient';
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

  // Load counties
  useEffect(() => {
    const fetchCounties = async () => {
      const { data } = await supabase.from('counties').select('*').order('name');
      if (data) setCounties(data);
    };
    fetchCounties();
  }, []);

  useEffect(() => {
    if (!selectedCounty) return;
    const fetchSubs = async () => {
      const { data } = await supabase
        .from('subcounties')
        .select('*')
        .eq('county', selectedCounty)
        .order('name');
      if (data) setSubcounties(data);
    };
    setSelectedSubcounty('');
    setSubcounties([]);
    setSelectedWard('');
    setWards([]);
    setSelectedPollingCentre('');
    setPollingCentres([]);
    fetchSubs();
  }, [selectedCounty]);

  useEffect(() => {
    if (!selectedSubcounty) return;
    const fetchWards = async () => {
      const { data } = await supabase
        .from('wards')
        .select('*')
        .eq('subcounty', selectedSubcounty)
        .order('name');
      if (data) setWards(data);
    };
    setSelectedWard('');
    setWards([]);
    setSelectedPollingCentre('');
    setPollingCentres([]);
    fetchWards();
  }, [selectedSubcounty]);

  useEffect(() => {
    if (!selectedWard) return;
    const fetchPolling = async () => {
      const { data } = await supabase
        .from('polling_centres')
        .select('*')
        .eq('ward', selectedWard)
        .order('name');
      if (data) setPollingCentres(data);
    };
    setSelectedPollingCentre('');
    setPollingCentres([]);
    fetchPolling();
  }, [selectedWard]);

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!username.trim()) return setInfo('❌ Please enter a username.');
    if (!/\S+@\S+\.\S+/.test(email)) return setInfo('❌ Invalid email format.');
    if (!/^\d{9}$/.test(mobile)) return setInfo('❌ Mobile must be 9 digits.');
    if (!selectedCounty || !selectedSubcounty || !selectedWard || !selectedPollingCentre)
      return setInfo('❌ Select full location.');

    // Step 1: Check if user already exists
    const { data: existing } = await supabase
      .from('voter')
      .select('id')
      .or(`username.eq.${username},mobile.eq.254${mobile}`)
      .maybeSingle();

    if (existing) {
      return setInfo('❌ User already registered.');
    }

    // Step 2: Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 mins

    // Step 3: Save OTP
    const { error: otpError } = await supabase.from('otp_verification').insert([{
      email,
      otp,
      expires_at: expiry,
    }]);

    if (otpError) {
      console.error(otpError);
      return setInfo('❌ Could not send OTP.');
    }

    // Step 4: Send Email using Supabase (email must match SMTP sender setup)
    const { error: mailError } = await supabase.functions.invoke('send-otp-email', {
      body: {
        email,
        otp,
      },
    });

    if (mailError) {
      console.error(mailError);
      return setInfo('❌ Could not send email.');
    }

    // Step 5: Store in localStorage
    localStorage.setItem(
      'pending_registration',
      JSON.stringify({
        username,
        email,
        mobile: `254${mobile}`,
        county: selectedCounty,
        subcounty: selectedSubcounty,
        ward: selectedWard,
        polling_centre: selectedPollingCentre,
      })
    );

    // Step 6: Redirect
    setInfo('✅ OTP sent to your email. Please verify.');
    setTimeout(() => {
      window.location.href = '/verify';
    }, 1500);
  };

  return (
    <div style={{
      maxWidth: 540, margin: '2rem auto', padding: 24, textAlign: 'center',
      border: '1px solid #ddd', borderRadius: 10, background: '#fff'
    }}>
      <Image src={logo} alt="OurWill Logo" width={140} />
      <form onSubmit={handleRegister} style={{ marginTop: 24 }}>
        <input type="text" placeholder="Username" value={username}
          onChange={(e) => setUsername(e.target.value)} required />
        <input type="email" placeholder="Email" value={email}
          onChange={(e) => setEmail(e.target.value)} required />
        <input type="tel" placeholder="Mobile (712345678)" maxLength={9}
          value={mobile} onChange={(e) => setMobile(e.target.value.replace(/\D/, ''))} required />

        <select value={selectedCounty} onChange={(e) => setSelectedCounty(e.target.value)} required>
          <option value="">Select County</option>
          {counties.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
        </select>

        <select value={selectedSubcounty} onChange={(e) => setSelectedSubcounty(e.target.value)} required>
          <option value="">Select Subcounty</option>
          {subcounties.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
        </select>

        <select value={selectedWard} onChange={(e) => setSelectedWard(e.target.value)} required>
          <option value="">Select Ward</option>
          {wards.map(w => <option key={w.name} value={w.name}>{w.name}</option>)}
        </select>

        <select value={selectedPollingCentre} onChange={(e) => setSelectedPollingCentre(e.target.value)} required>
          <option value="">Select Polling Centre</option>
          {pollingCentres.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
        </select>

        <button type="submit" style={{ marginTop: 16 }}>Register</button>
        {info && <p style={{ marginTop: 20 }}>{info}</p>}
      </form>
    </div>
  );
};

export default RegisterUser;
