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

  // Fetch counties
  useEffect(() => {
    const fetchCounties = async () => {
      const { data, error } = await supabase.from('counties').select('*').order('name');
      if (!error) setCounties(data);
    };
    fetchCounties();
  }, []);

  // Fetch subcounties
  useEffect(() => {
    const fetchSubcounties = async () => {
      if (!selectedCounty) return;
      const { data, error } = await supabase
        .from('subcounties')
        .select('*')
        .eq('county', selectedCounty)
        .order('name');
      if (!error) setSubcounties(data);
    };
    setSelectedSubcounty('');
    setSelectedWard('');
    setSelectedPollingCentre('');
    setSubcounties([]);
    setWards([]);
    setPollingCentres([]);
    if (selectedCounty) fetchSubcounties();
  }, [selectedCounty]);

  // Fetch wards
  useEffect(() => {
    const fetchWards = async () => {
      if (!selectedSubcounty) return;
      const { data, error } = await supabase
        .from('wards')
        .select('*')
        .eq('subcounty', selectedSubcounty)
        .order('name');
      if (!error) setWards(data);
    };
    setSelectedWard('');
    setSelectedPollingCentre('');
    setWards([]);
    setPollingCentres([]);
    if (selectedSubcounty) fetchWards();
  }, [selectedSubcounty]);

  // Fetch polling centres
  useEffect(() => {
    const fetchPolling = async () => {
      if (!selectedWard) return;
      const { data, error } = await supabase
        .from('polling_centres')
        .select('*')
        .eq('ward', selectedWard)
        .order('name');
      if (!error) setPollingCentres(data);
    };
    setSelectedPollingCentre('');
    setPollingCentres([]);
    if (selectedWard) fetchPolling();
  }, [selectedWard]);

  // Check uniqueness
  const checkUniqueness = async () => {
    const { data, error } = await supabase
      .from('voter')
      .select('email, mobile, username')
      .or(`email.eq.${email},mobile.eq.254${mobile},username.eq.${username}`);
    return { data, error };
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!username.trim()) return setInfo('❌ Please enter a username.');
    if (!/\S+@\S+\.\S+/.test(email)) return setInfo('❌ Please enter a valid email.');
    if (!/^\d{9}$/.test(mobile)) return setInfo('❌ Enter a valid 9-digit mobile number.');
    if (!selectedCounty || !selectedSubcounty || !selectedWard || !selectedPollingCentre) {
      return setInfo('❌ Please select your full location.');
    }

    const formattedMobile = `254${mobile}`;
    setInfo('⏳ Checking existing records...');

    const { data: existing, error: checkError } = await checkUniqueness();
    if (checkError) return setInfo('❌ Error checking database.');
    if (existing.length > 0) return setInfo('❌ Email, mobile, or username already exists.');

    // Step 1: Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes from now

    // Step 2: Store OTP in Supabase
    const { error: otpError } = await supabase.from('otp_verification').insert([
      { email, otp, expires_at: expiresAt }
    ]);

    if (otpError) {
      console.error('OTP save error:', otpError);
      return setInfo('❌ Could not store OTP.');
    }

    // Step 3: Send OTP via EmailJS
    setInfo('📧 Sending OTP...');
    try {
      await emailjs.send(
        'your_service_id',     // Replace with actual
        'your_template_id',    // Replace with actual
        { to_email: email, otp },
        'your_public_key'      // Replace with actual
      );
    } catch (err) {
      console.error('EmailJS error:', err);
      return setInfo('❌ Failed to send email.');
    }

    // Step 4: Store user input in localStorage
    localStorage.setItem('pending_registration', JSON.stringify({
      email,
      username,
      mobile: formattedMobile,
      county: selectedCounty,
      subcounty: selectedSubcounty,
      ward: selectedWard,
      polling_centre: selectedPollingCentre,
    }));

    setInfo('✅ OTP sent! Check your email and verify.');
  };

  return (
    <div
      style={{
        maxWidth: 540,
        margin: '2rem auto',
        padding: 24,
        textAlign: 'center',
        border: '1px solid #ddd',
        borderRadius: 10,
        backgroundImage: 'url(/kenya-flag.jpg)',
        backgroundSize: '200%',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: 'rgba(255,255,255,0.7)',
        backgroundBlendMode: 'overlay',
        boxShadow: '0 0 12px rgba(0,0,0,0.3)',
      }}
    >
      <Image src={logo} alt="OurWill Logo" width={140} />
      <form onSubmit={handleRegister} style={{ marginTop: 24 }}>
        <input type="text" placeholder="Unique Username" value={username}
          onChange={(e) => setUsername(e.target.value)} required
          style={{ width: '90%', padding: 10, margin: '10px 0' }} />
        <input type="email" placeholder="Email address" value={email}
          onChange={(e) => setEmail(e.target.value)} required
          style={{ width: '90%', padding: 10, margin: '10px 0' }} />
        <input type="tel" placeholder="Mobile (712345678)" value={mobile}
          onChange={(e) => setMobile(e.target.value.replace(/\D/, ''))}
          maxLength={9} required style={{ width: '90%', padding: 10, margin: '10px 0' }} />

        <select value={selectedCounty} onChange={(e) => setSelectedCounty(e.target.value)} required style={{ width: '90%', padding: 10, margin: '10px 0' }}>
          <option value="">-- Select County --</option>
          {counties.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
        </select>
        <select value={selectedSubcounty} onChange={(e) => setSelectedSubcounty(e.target.value)} required disabled={!selectedCounty} style={{ width: '90%', padding: 10, margin: '10px 0' }}>
          <option value="">-- Select Subcounty --</option>
          {subcounties.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
        </select>
        <select value={selectedWard} onChange={(e) => setSelectedWard(e.target.value)} required disabled={!selectedSubcounty} style={{ width: '90%', padding: 10, margin: '10px 0' }}>
          <option value="">-- Select Ward --</option>
          {wards.map((w) => <option key={w.id} value={w.name}>{w.name}</option>)}
        </select>
        <select value={selectedPollingCentre} onChange={(e) => setSelectedPollingCentre(e.target.value)} required disabled={!selectedWard} style={{ width: '90%', padding: 10, margin: '10px 0' }}>
          <option value="">-- Select Polling Centre --</option>
          {pollingCentres.map((p) => <option key={p.id} value={p.name}>{p.name}</option>)}
        </select>

        <button type="submit" style={{ marginTop: 16, padding: '10px 20px', fontWeight: 'bold' }}>
          Register
        </button>
        {info && <p style={{ marginTop: 20, color: info.startsWith('✅') ? 'green' : info.startsWith('❌') ? 'red' : '#333' }}>{info}</p>}
      </form>
    </div>
  );
};

export default RegisterUser;
