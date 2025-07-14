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

    // Basic validations
    if (!username.trim()) return setInfo('❌ Please enter a username.');
    if (!/\S+@\S+\.\S+/.test(email)) return setInfo('❌ Please enter a valid email.');
    if (!/^\d{9}$/.test(mobile)) return setInfo('❌ Enter a valid 9-digit mobile number.');
    if (!selectedCounty || !selectedSubcounty || !selectedWard || !selectedPollingCentre) {
      return setInfo('❌ Please select your full location.');
    }

    const formattedMobile = `254${mobile}`;
    setInfo('⏳ Checking for duplicates...');

    // Check uniqueness
    const { data: existing, error: checkError } = await supabase
      .from('voter')
      .select('email, mobile, username')
      .or(`email.eq.${email},mobile.eq.${formattedMobile},username.eq.${username}`);

    if (checkError) return setInfo('❌ Error checking existing users.');
    if (existing.length > 0) return setInfo('❌ Email, mobile, or username already registered.');

    setInfo('⏳ Saving your details...');

    // Insert into voter table with status 'pending'
    const { error: insertError } = await supabase
      .from('voter')
      .insert([{
        email,
        username,
        mobile: formattedMobile,
        county_code: selectedCounty,
        subcounty_code: selectedSubcounty,
        ward_code: selectedWard,
        polling_centre_id: selectedPollingCentre,
        status: 'pending',
      }]);

    if (insertError) {
      console.error(insertError);
      return setInfo('❌ Failed to save data. Try again.');
    }

    // Send OTP login link
    setInfo('⏳ Sending OTP login link...');
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/callback`,
      },
    });

    if (otpError) {
      console.error(otpError);
      return setInfo('❌ Failed to send login link.');
    }

    setInfo('✅ Registration saved. Check your email to verify login.');
  };

  return (
    <div style={{
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
    }}>
      <Image src={logo} alt="OurWill Logo" width={140} />
      <form onSubmit={handleRegister} style={{ marginTop: 24 }}>
        <input type="text" placeholder="Unique Username" value={username} onChange={(e) => setUsername(e.target.value)} required style={{ width: '90%', padding: 10, margin: '10px 0' }} />
        <input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '90%', padding: 10, margin: '10px 0' }} />
        <input type="tel" placeholder="Mobile (712345678)" value={mobile} onChange={(e) => setMobile(e.target.value.replace(/\D/, ''))} maxLength={9} required style={{ width: '90%', padding: 10, margin: '10px 0' }} />
        <select value={selectedCounty} onChange={(e) => setSelectedCounty(e.target.value)} required style={{ width: '90%', padding: 10, margin: '10px 0' }}>
          <option value="">-- Select County --</option>
          {counties.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
        </select>
        <
