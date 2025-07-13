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

  // Real-time validation
  const [emailError, setEmailError] = useState('');
  const [mobileError, setMobileError] = useState('');
  const [usernameError, setUsernameError] = useState('');

  // Fetch location data
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

  // Validation functions
  const checkEmail = async (value) => {
    setEmail(value);
    if (!/\S+@\S+\.\S+/.test(value)) {
      setEmailError('Invalid email format');
      return;
    }
    const { data } = await supabase.from('voter').select('id').eq('email', value).maybeSingle();
    setEmailError(data ? 'Email already used' : '');
  };

  const checkMobile = async (value) => {
    const cleaned = value.replace(/\D/g, '');
    setMobile(cleaned);
    if (cleaned.length !== 9) {
      setMobileError('Must be 9 digits');
      return;
    }
    const formatted = `254${cleaned}`;
    const { data } = await supabase.from('voter').select('id').eq('mobile', formatted).maybeSingle();
    setMobileError(data ? 'Mobile already registered' : '');
  };

  const checkUsername = async (value) => {
    setUsername(value);
    if (value.length < 3) {
      setUsernameError('Must be at least 3 characters');
      return;
    }
    const { data } = await supabase.from('voter').select('id').eq('username', value).maybeSingle();
    setUsernameError(data ? 'Username taken' : '');
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!username || !email || !mobile) return setInfo('❌ Fill all fields.');
    if (emailError || mobileError || usernameError) {
      return setInfo('❌ Fix validation errors first.');
    }
    if (!selectedCounty || !selectedSubcounty || !selectedWard || !selectedPollingCentre) {
      return setInfo('❌ Complete location details.');
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
    <div
      style={{
        maxWidth: 520,
        margin: '2rem auto',
        padding: 24,
        textAlign: 'center',
        border: '1px solid #ddd',
        borderRadius: 10,
        backgroundImage: 'url(/kenya-flag.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: 'white',
        boxShadow: '0 0 10px rgba(0,0,0,0.3)',
      }}
    >
      <Image src={logo} alt="OurWill Logo" width={120} />
      <form onSubmit={handleRegister} style={{ marginTop: 20 }}>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => checkUsername(e.target.value)}
          required
          style={{ width: '90%', padding: 10, margin: '10px 0' }}
        />
        {usernameError && <p style={{ color: 'yellow', margin: 0 }}>{usernameError}</p>}

        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => checkEmail(e.target.value)}
          required
          style={{ width: '90%', padding: 10, margin: '10px 0' }}
        />
        {emailError && <p style={{ color: 'yellow', margin: 0 }}>{emailError}</p>}

        <input
          type="tel"
          placeholder="Mobile e.g. 712345678"
          value={mobile}
          onChange={(e) => checkMobile(e.target.value)}
          maxLength={9}
          required
          style={{ width: '90%', padding: 10, margin: '10px 0' }}
        />
        {mobileError && <p style={{ color: 'yellow', margin: 0 }}>{mobileError}</p>}

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

        <button type="submit" style={{ marginTop: 20, padding: '10px 20px', background: 'white', color: '#000', fontWeight: 'bold' }}>
          Register / Login
        </button>

        {info && (
          <p style={{ marginTop: 20, color: info.startsWith('✅') ? '#00ffcc' : info.startsWith('❌') ? 'red' : '#ffff99' }}>
            {info}
          </p>
        )}
      </form>
    </div>
  );
};

export default RegisterUser;
