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
      const { data, error } = await supabase.from('counties').select('*').order('name');
      if (!error) setCounties(data);
    };
    fetchCounties();
  }, []);

  useEffect(() => {
    const fetchSubcounties = async () => {
      if (!selectedCounty) return;
      const { data, error } = await supabase.from('subcounties').select('*').eq('county_code', selectedCounty).order('name');
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

  useEffect(() => {
    const fetchWards = async () => {
      if (!selectedSubcounty) return;
      const { data, error } = await supabase.from('wards').select('*').eq('subcounty_code', selectedSubcounty).order('name');
      if (!error) setWards(data);
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
      const { data, error } = await supabase.from('polling_centres').select('*').eq('ward_code', selectedWard).order('name');
      if (!error) setPollingCentres(data);
    };
    setSelectedPollingCentre('');
    setPollingCentres([]);
    if (selectedWard) fetchPolling();
  }, [selectedWard]);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!username.trim()) return setInfo('❌ Please enter a username.');
    if (!/\S+@\S+\.\S+/.test(email)) return setInfo('❌ Enter valid email.');
    if (!/^\d{9}$/.test(mobile)) return setInfo('❌ Enter 9-digit mobile e.g. 712345678');

    const formattedMobile = `254${mobile}`;
    if (!/^2547\d{8}$/.test(formattedMobile)) return setInfo('❌ Must begin with 2547XXXXXXXX.');

    if (!selectedCounty || !selectedSubcounty || !selectedWard || !selectedPollingCentre) {
      return setInfo('❌ Complete your location selection.');
    }

    setInfo('⏳ Validating...');
    const { data: exists } = await supabase.from('voter').select('id').or(`email.eq.${email},mobile.eq.${formattedMobile},username.eq.${username}`);
    if (exists?.length > 0) return setInfo('❌ Already registered.');

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const { error: otpError } = await supabase.from('otp_verification').insert([{ email, mobile: formattedMobile, otp, used: false }]);
    if (otpError) return setInfo('❌ Failed to save OTP.');

    try {
      const now = new Date().toLocaleString();
      await emailjs.send('service_21itetw', 'template_ks69v69', { email, passcode: otp, time: now }, 'OrOyy74P28MfrgPhr');
      localStorage.setItem('pending_registration', JSON.stringify({ email, username, mobile: formattedMobile, county: selectedCounty, subcounty: selectedSubcounty, ward: selectedWard, polling_centre: selectedPollingCentre }));
      setInfo('✅ OTP sent. Redirecting to verify...');
      setTimeout(() => window.location.href = '/verify', 1000);
    } catch (err) {
      console.error('Email send error:', err);
      setInfo('❌ Failed to send OTP email.');
    }
  };

  return (
    <div style={{ maxWidth: 540, margin: '2rem auto', padding: 24, textAlign: 'center', background: '#fff', border: '1px solid #ccc', borderRadius: 10 }}>
      <Image src={logo} alt="OurWill Logo" width={140} />
      <form onSubmit={handleRegister} style={{ marginTop: 24 }}>
        <input type="text" placeholder="Unique Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="tel" placeholder="Mobile (712345678)" value={mobile} onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))} maxLength={9} required />

        <select value={selectedCounty} onChange={(e) => setSelectedCounty(e.target.value)} required>
          <option value="">-- Select County --</option>
          {counties.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
        </select>

        <select value={selectedSubcounty} onChange={(e) => setSelectedSubcounty(e.target.value)} required>
          <option value="">-- Select Subcounty --</option>
          {subcounties.map((s) => <option key={s.code} value={s.code}>{s.name}</option>)}
        </select>

        <select value={selectedWard} onChange={(e) => setSelectedWard(e.target.value)} required>
          <option value="">-- Select Ward --</option>
          {wards.map((w) => <option key={w.code} value={w.code}>{w.name}</option>)}
        </select>

        <select value={selectedPollingCentre} onChange={(e) => setSelectedPollingCentre(e.target.value)} required>
          <option value="">-- Select Polling Centre --</option>
          {pollingCentres.map((p) => <option key={p.id} value={p.name}>{p.name}</option>)}
        </select>

        <button type="submit">Register</button>
        {info && <p>{info}</p>}
      </form>
    </div>
  );
};

export default RegisterUser;
