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
      const { data, error } = await supabase.from('counties').select('*').order('name');
      if (!error) setCounties(data);
    };
    fetchCounties();
  }, []);

  useEffect(() => {
    const fetchSubcounties = async () => {
      if (!selectedCounty) return;
      const { data, error } = await supabase
        .from('subcounties')
        .select('*')
        .eq('county_code', selectedCounty)
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

  useEffect(() => {
    const fetchWards = async () => {
      if (!selectedSubcounty) return;
      const { data, error } = await supabase
        .from('wards')
        .select('*')
        .eq('subcounty_code', selectedSubcounty)
        .order('name');
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
      const { data, error } = await supabase
        .from('polling_centres')
        .select('*')
        .eq('ward_code', selectedWard)
        .order('name');
      if (!error) setPollingCentres(data);
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

    const formattedMobile = `254${mobile}`;
    setInfo('⏳ Sending login link to your email...');

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/callback`,
      },
    });

    if (error) {
      console.error(error);
      return setInfo('❌ Failed to send login link. Try again.');
    }

    localStorage.setItem('pending_registration', JSON.stringify({
      email,
      username,
      mobile: formattedMobile,
      county_code: selectedCounty,
      subcounty_code: selectedSubcounty,
      ward_code: selectedWard,
      polling_centre_id: selectedPollingCentre,
    }));

    setInfo('✅ Check your email for the login link.');
  };

  return (
    <div style={{
      background: 'linear-gradient(rgba(255,255,255,0.75), rgba(255,255,255,0.75)), url("https://upload.wikimedia.org/wikipedia/commons/4/49/Flag_of_Kenya.svg") center / cover no-repeat',
      backgroundAttachment: 'fixed',
      minHeight: '100vh',
      paddingTop: '3rem'
    }}>
      <div style={{
        maxWidth: 520,
        margin: '0 auto',
        padding: '2rem',
        textAlign: 'center',
        backgroundColor: 'white',
        borderRadius: '1rem',
        boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
      }}>
        <Image src={logo} alt="OurWill Logo" width={160} />
        <form onSubmit={handleRegister} style={{ marginTop: 24 }}>
          <input
            type="text"
            placeholder="Username"
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
            placeholder="Mobile e.g. 712345678"
            value={mobile}
            onChange={(e) => setMobile(e.target.value.replace(/\D/, ''))}
            maxLength={9}
            required
            style={{ width: '90%', padding: 10, margin: '10px 0' }}
          />

          <select value={selectedCounty} onChange={(e) => setSelectedCounty(e.target.value)} required style={{ width: '90%', padding: 10, margin: '10px 0' }}>
            <option value="">-- Select County --</option>
            {counties.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
          </select>

          <select value={selectedSubcounty} onChange={(e) => setSelectedSubcounty(e.target.value)} required disabled={!selectedCounty} style={{ width: '90%', padding: 10, margin: '10px 0' }}>
            <option value="">-- Select Subcounty --</option>
            {subcounties.map((s) => <option key={s.code} value={s.code}>{s.name}</option>)}
          </select>

          <select value={selectedWard} onChange={(e) => setSelectedWard(e.target.value)} required disabled={!selectedSubcounty} style={{ width: '90%', padding: 10, margin: '10px 0' }}>
            <option value="">-- Select Ward --</option>
            {wards.map((w) => <option key={w.code} value={w.code}>{w.name}</option>)}
          </select>

          <select value={selectedPollingCentre} onChange={(e) => setSelectedPollingCentre(e.target.value)} required disabled={!selectedWard} style={{ width: '90%', padding: 10, margin: '10px 0' }}>
            <option value="">-- Select Polling Centre --</option>
            {pollingCentres.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>

          <button type="submit" style={{ marginTop: 16, padding: '10px 20px', backgroundColor: '#0B5ED7', color: '#fff', border: 'none', borderRadius: 8 }}>
            Register / Login
          </button>

          {info && <p style={{ marginTop: 20, color: info.startsWith('✅') ? 'green' : info.startsWith('❌') ? 'red' : '#333' }}>{info}</p>}
        </form>
      </div>
    </div>
  );
};

export default RegisterUser;
