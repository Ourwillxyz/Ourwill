import { useState, useEffect } from 'react';
import { supabase } from '../src/supabaseClient';

export default function RegisterUser() {
  const [counties, setCounties] = useState([]);
  const [subcounties, setSubcounties] = useState([]);
  const [wards, setWards] = useState([]);
  const [pollingCentres, setPollingCentres] = useState([]);

  const [selectedCounty, setSelectedCounty] = useState('');
  const [selectedSubcounty, setSelectedSubcounty] = useState('');
  const [selectedWard, setSelectedWard] = useState('');
  const [selectedPollingCentre, setSelectedPollingCentre] = useState('');

  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [name, setName] = useState('');
  const [info, setInfo] = useState('');

  // Fetch counties
  useEffect(() => {
    const fetchCounties = async () => {
      const { data } = await supabase.from('counties').select('*').order('name');
      setCounties(data);
    };
    fetchCounties();
  }, []);

  // Fetch subcounties
  useEffect(() => {
    const fetchSub = async () => {
      const { data } = await supabase
        .from('subcounties')
        .select('*')
        .eq('county_code', selectedCounty)
        .order('name');
      setSubcounties(data || []);
      setSelectedSubcounty('');
      setWards([]);
      setPollingCentres([]);
    };
    if (selectedCounty) fetchSub();
  }, [selectedCounty]);

  // Fetch wards
  useEffect(() => {
    const fetchWards = async () => {
      const { data } = await supabase
        .from('wards')
        .select('*')
        .eq('subcounty_code', selectedSubcounty)
        .order('name');
      setWards(data || []);
      setSelectedWard('');
      setPollingCentres([]);
    };
    if (selectedSubcounty) fetchWards();
  }, [selectedSubcounty]);

  // Fetch polling centres
  useEffect(() => {
    const fetchPolling = async () => {
      const { data } = await supabase
        .from('polling_centres')
        .select('*')
        .eq('ward_code', selectedWard)
        .order('name');
      setPollingCentres(data || []);
      setSelectedPollingCentre('');
    };
    if (selectedWard) fetchPolling();
  }, [selectedWard]);

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!email || !mobile || !name || !selectedCounty || !selectedSubcounty || !selectedWard || !selectedPollingCentre) {
      setInfo('Please complete all required fields.');
      return;
    }

    setInfo('Sending magic link...');

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/callback`,
      },
    });

    if (error) {
      console.error(error.message);
      setInfo('❌ Failed to send magic link. Try again.');
    } else {
      setInfo('✅ Magic link sent! Check your email.');
    }
  };

  return (
    <div style={{
      background: '#f4faff',
      minHeight: '100vh',
      paddingTop: '2rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      fontFamily: 'Arial, sans-serif',
    }}>
      <img
        src="/ourwill-logo.png"
        alt="OurWill Logo"
        style={{ width: '180px', marginBottom: '2rem' }}
      />

      <form onSubmit={handleRegister} style={{
        background: 'white',
        padding: 24,
        borderRadius: 8,
        boxShadow: '0 0 10px rgba(0,0,0,0.1)',
        maxWidth: 450,
        width: '100%'
      }}>
        <label>Full Name:<br />
          <input type="text" value={name} onChange={e => setName(e.target.value)} required style={inputStyle} />
        </label>
        <label>Mobile Number:<br />
          <input type="text" value={mobile} onChange={e => setMobile(e.target.value)} required placeholder="2547XXXXXXX" style={inputStyle} />
        </label>
        <label>Email Address:<br />
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={inputStyle} />
        </label>
        <label>County:<br />
          <select value={selectedCounty} onChange={e => setSelectedCounty(e.target.value)} required style={inputStyle}>
            <option value="">-- Select County --</option>
            {counties.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
          </select>
        </label>
        <label>Subcounty:<br />
          <select value={selectedSubcounty} onChange={e => setSelectedSubcounty(e.target.value)} required disabled={!selectedCounty} style={inputStyle}>
            <option value="">-- Select Subcounty --</option>
            {subcounties.map(s => <option key={s.code} value={s.code}>{s.name}</option>)}
          </select>
        </label>
        <label>Ward:<br />
          <select value={selectedWard} onChange={e => setSelectedWard(e.target.value)} required disabled={!selectedSubcounty} style={inputStyle}>
            <option value="">-- Select Ward --</option>
            {wards.map(w => <option key={w.code} value={w.code}>{w.name}</option>)}
          </select>
        </label>
        <label>Polling Centre:<br />
          <select value={selectedPollingCentre} onChange={e => setSelectedPollingCentre(e.target.value)} required disabled={!selectedWard} style={inputStyle}>
            <option value="">-- Select Centre --</option>
            {pollingCentres.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </label>
        <button type="submit" style={buttonStyle}>Send Magic Link</button>
      </form>

      {info && <p style={{ marginTop: 20, color: info.includes('✅') ? 'green' : 'red' }}>{info}</p>}
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: 10,
  marginTop: 4,
  marginBottom: 16,
  borderRadius: 4,
  border: '1px solid #ccc'
};

const buttonStyle = {
  width: '100%',
  padding: 12,
  backgroundColor: '#0070f3',
  color: 'white',
  border: 'none',
  borderRadius: 4,
  fontSize: '1rem',
  cursor: 'pointer'
};
