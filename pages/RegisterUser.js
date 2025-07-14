import { useState, useEffect } from 'react';
import { supabase } from '../src/supabaseClient';
import Image from 'next/image';
import logo from '../public/ourwill-logo.png';
import emailjs from 'emailjs-com';

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

  // Uniqueness check
  const checkUniqueness = async () => {
    const { data, error } = await supabase
      .from('voter')
      .select('email, mobile, username')
      .or(`email.eq.${email},mobile.eq.254${mobile},username.eq.${username}`);
    return { data, error };
  };

  // OTP generator
  const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

  // Handle form submit
  const handleRegister = async (e) => {
    e.preventDefault();

    if (!username.trim()) return setInfo('❌ Please enter a username.');
    if (!/\S+@\S+\.\S+/.test(email)) return setInfo('❌ Enter valid email.');
    if (!/^\d{9}$/.test(mobile)) return setInfo('❌ 9-digit mobile only.');
    if (!selectedCounty || !selectedSubcounty || !selectedWard || !selectedPollingCentre) {
      return setInfo('❌ Fill your full location.');
    }

    const formattedMobile = `254${mobile}`;
    setInfo('⏳ Checking existing users...');

    const { data: existing, error } = await checkUniqueness();
    if (error) return setInfo('❌ Error checking uniqueness.');
    if (existing.length > 0) return setInfo('❌ Email, mobile or username in use.');

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 min expiry

    // Save to otp_verification
    const { error: otpSaveError } = await supabase.from('otp_verification').insert([
      {
        email,
        otp,
        expires_at: expiresAt,
        used: false,
      },
    ]);
    if (otpSaveError) {
      console.error(otpSaveError);
      return setInfo('❌ Failed to save OTP.');
    }

    // Send OTP via EmailJS
    try {
      await emailjs.send(
        'YOUR_SERVICE_ID',
        'YOUR_TEMPLATE_ID',
        {
          to_email: email,
          to_name: username,
          otp_code: otp,
        },
        'YOUR_PUBLIC_KEY'
      );
    } catch (emailError) {
      console.error(emailError);
      return setInfo('❌ Failed to send OTP email.');
    }

    // Save pending data
    localStorage.setItem('pending_registration', JSON.stringify({
      email,
      username,
      mobile: formattedMobile,
      county: selectedCounty,
      subcounty: selectedSubcounty,
      ward: selectedWard,
      polling_centre: selectedPollingCentre,
    }));

    setInfo('✅ OTP sent to your email. Enter it on the next page.');
    setTimeout(() => {
      window.location.href = '/verify';
    }, 1500);
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
        <input
          type="text"
          placeholder="Unique Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          style={{ width: '90%', padding: 10, margin: '10px 0' }}
        />
        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: '90%', padding: 10, margin: '10px 0' }}
        />
        <input
          type="tel"
          placeholder="Mobile (712345678)"
          value={mobile}
          onChange={(e) => setMobile(e.target.value.replace(/\D/, ''))}
          maxLength={9}
          required
          style={{ width: '90%', padding: 10, margin: '10px 0' }}
        />

        <select value={selectedCounty} onChange={(e) => setSelectedCounty(e.target.value)} required style={{ width: '90%', padding: 10, margin: '10px 0' }}>
          <option value="">-- Select County --</option>
          {counties.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
        </select>
        <select value={selectedSubcounty} onChange={(e) => setSelectedSubcounty(e.target.value)} required disabled={!selectedCounty} style={{ width: '90%', padding: 10, margin: '10px 0' }}>
          <option value="">-- Select Subcounty --</option>
          {subcounties.map((s) => <option key={s.name} value={s.name}>{s.name}</option>)}
        </select>
        <select value={selectedWard} onChange={(e) => setSelectedWard(e.target.value)} required disabled={!selectedSubcounty} style={{ width: '90%', padding: 10, margin: '10px 0' }}>
          <option value="">-- Select Ward --</option>
          {wards.map((w) => <option key={w.name} value={w.name}>{w.name}</option>)}
        </select>
        <select value={selectedPollingCentre} onChange={(e) => setSelectedPollingCentre(e.target.value)} required disabled={!selectedWard} style={{ width: '90%', padding: 10, margin: '10px 0' }}>
          <option value="">-- Select Polling Centre --</option>
          {pollingCentres.map((p) => <option key={p.name} value={p.name}>{p.name}</option>)}
        </select>

        <button type="submit" style={{ marginTop: 16, padding: '10px 20px', fontWeight: 'bold' }}>
          Register / Request OTP
        </button>
        {info && <p style={{ marginTop: 20, color: info.startsWith('✅') ? 'green' : info.startsWith('❌') ? 'red' : '#333' }}>{info}</p>}
      </form>
    </div>
  );
};

export default RegisterUser;
