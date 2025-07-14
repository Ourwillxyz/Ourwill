// pages/RegisterUser.js
import { useState, useEffect } from 'react';
import { supabase } from '../src/supabaseClient';
import Image from 'next/image';
import emailjs from 'emailjs-com';
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

  // Load location data
  useEffect(() => {
    const loadCounties = async () => {
      const { data } = await supabase.from('counties').select('*').order('name');
      setCounties(data || []);
    };
    loadCounties();
  }, []);

  useEffect(() => {
    const loadSubcounties = async () => {
      if (!selectedCounty) return;
      const { data } = await supabase
        .from('subcounties')
        .select('*')
        .eq('county', selectedCounty)
        .order('name');
      setSubcounties(data || []);
    };
    loadSubcounties();
    setSelectedSubcounty('');
    setSelectedWard('');
    setSelectedPollingCentre('');
  }, [selectedCounty]);

  useEffect(() => {
    const loadWards = async () => {
      if (!selectedSubcounty) return;
      const { data } = await supabase
        .from('wards')
        .select('*')
        .eq('subcounty', selectedSubcounty)
        .order('name');
      setWards(data || []);
    };
    loadWards();
    setSelectedWard('');
    setSelectedPollingCentre('');
  }, [selectedSubcounty]);

  useEffect(() => {
    const loadPolling = async () => {
      if (!selectedWard) return;
      const { data } = await supabase
        .from('polling_centres')
        .select('*')
        .eq('ward', selectedWard)
        .order('name');
      setPollingCentres(data || []);
    };
    loadPolling();
    setSelectedPollingCentre('');
  }, [selectedWard]);

  const handleRegister = async (e) => {
    e.preventDefault();

    // Basic validations
    if (!username.trim() || !email.includes('@') || mobile.length !== 9 || !selectedCounty || !selectedPollingCentre) {
      return setInfo('❌ Please fill all fields correctly.');
    }

    const fullMobile = `254${mobile}`;

    // Check for duplicates
    const { data: existing } = await supabase
      .from('voter')
      .select('id')
      .or(`email.eq.${email},mobile.eq.${fullMobile},username.eq.${username}`)
      .maybeSingle();

    if (existing) return setInfo('❌ User with these credentials already exists.');

    // Step 1: Save pending data locally
    localStorage.setItem('pending_registration', JSON.stringify({
      username,
      email,
      mobile: fullMobile,
      county: selectedCounty,
      subcounty: selectedSubcounty,
      ward: selectedWard,
      polling_centre: selectedPollingCentre,
    }));

    // Step 2: Generate OTP and store it in Supabase
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60000).toISOString(); // 10 minutes

    const { error: otpError } = await supabase.from('otp_verification').insert([{
      email,
      otp,
      expires_at: expiry,
      used: false,
    }]);

    if (otpError) {
      console.error(otpError);
      return setInfo('❌ Failed to store OTP.');
    }

    // Step 3: Send email using EmailJS
    try {
      await emailjs.send(
        'service_21itetw',    // Replace with your actual EmailJS service ID
        'your_template_id',   // Replace with your template ID
        {
          to_email: email,
          otp: otp,
        },
        'your_public_key'     // Your EmailJS public key
      );
      setInfo('✅ OTP sent to your email. Please verify.');
    } catch (emailError) {
      console.error(emailError);
      setInfo('❌ Failed to send OTP email.');
    }

    // Step 4: Navigate to /verify
    setTimeout(() => {
      window.location.href = '/verify';
    }, 1500);
  };

  return (
    <div style={{ maxWidth: 540, margin: '2rem auto', padding: 24, textAlign: 'center', border: '1px solid #ccc', borderRadius: 10 }}>
      <Image src={logo} alt="OurWill Logo" width={140} />
      <h2>Register to Vote</h2>
      <form onSubmit={handleRegister} style={{ marginTop: 20 }}>
        <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
        <input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="tel" placeholder="Mobile (712345678)" maxLength={9} value={mobile} onChange={(e) => setMobile(e.target.value.replace(/\D/, ''))} required />
        
        <select value={selectedCounty} onChange={(e) => setSelectedCounty(e.target.value)} required>
          <option value="">-- Select County --</option>
          {counties.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
        </select>

        <select value={selectedSubcounty} onChange={(e) => setSelectedSubcounty(e.target.value)} required disabled={!selectedCounty}>
          <option value="">-- Select Subcounty --</option>
          {subcounties.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
        </select>

        <select value={selectedWard} onChange={(e) => setSelectedWard(e.target.value)} required disabled={!selectedSubcounty}>
          <option value="">-- Select Ward --</option>
          {wards.map((w) => <option key={w.id} value={w.name}>{w.name}</option>)}
        </select>

        <select value={selectedPollingCentre} onChange={(e) => setSelectedPollingCentre(e.target.value)} required disabled={!selectedWard}>
          <option value="">-- Select Polling Centre --</option>
          {pollingCentres.map((p) => <option key={p.id} value={p.name}>{p.name}</option>)}
        </select>

        <button type="submit" style={{ marginTop: 20 }}>Send OTP</button>
        {info && <p style={{ marginTop: 10 }}>{info}</p>}
      </form>
    </div>
  );
};

export default RegisterUser;
