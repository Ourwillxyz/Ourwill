import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../src/supabaseClient';

function generateOtp() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

export default function RegisterUser() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [counties, setCounties] = useState([]);
  const [subcounties, setSubcounties] = useState([]);
  const [wards, setWards] = useState([]);
  const [pollingCentres, setPollingCentres] = useState([]);

  const [county, setCounty] = useState('');
  const [subcounty, setSubcounty] = useState('');
  const [ward, setWard] = useState('');
  const [pollingCentre, setPollingCentre] = useState('');

  const [status, setStatus] = useState('');

  // Fetch counties
  useEffect(() => {
    const fetchCounties = async () => {
      const { data } = await supabase.from('counties').select('*').order('name');
      if (data) setCounties(data);
    };
    fetchCounties();
  }, []);

  // Fetch subcounties
  useEffect(() => {
    if (!county) return;
    const fetchSubs = async () => {
      const { data } = await supabase
        .from('subcounties')
        .select('*')
        .eq('county_code', county)
        .order('name');
      if (data) setSubcounties(data);
    };
    fetchSubs();
  }, [county]);

  // Fetch wards
  useEffect(() => {
    if (!subcounty) return;
    const fetchWards = async () => {
      const { data } = await supabase
        .from('wards')
        .select('*')
        .eq('subcounty_code', subcounty)
        .order('name');
      if (data) setWards(data);
    };
    fetchWards();
  }, [subcounty]);

  // Fetch polling centres
  useEffect(() => {
    if (!ward) return;
    const fetchCentres = async () => {
      const { data } = await supabase
        .from('polling_centres')
        .select('*')
        .eq('ward_code', ward)
        .order('name');
      if (data) setPollingCentres(data);
    };
    fetchCentres();
  }, [ward]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !mobile || !county || !subcounty || !ward || !pollingCentre) {
      setStatus('⚠️ Please fill in all fields.');
      return;
    }

    setStatus('🔄 Sending magic link...');

    // Store voter info locally for retrieval after login
    const voterData = {
      email,
      mobile,
      county_code: county,
      subcounty_code: subcounty,
      ward_code: ward,
      polling_centre_id: pollingCentre,
    };

    localStorage.setItem('pendingVoter', JSON.stringify(voterData));

    // Send Supabase magic link
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: 'https://your-vercel-app.vercel.app/callback',
      },
    });

    if (error) {
      setStatus(`❌ Error sending magic link: ${error.message}`);
    } else {
      setStatus('✅ Magic link sent! Check your inbox.');
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: 'auto', padding: 40 }}>
      <h2>User Registration</h2>
      <form onSubmit={handleSubmit}>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="Email" style={{ width: '100%', padding: 8, margin: '10px 0' }} />
        <input type="text" value={mobile} onChange={(e) => setMobile(e.target.value)} required placeholder="Mobile (2547XXXXXXXX)" style={{ width: '100%', padding: 8, margin: '10px 0' }} />

        <select value={county} onChange={(e) => setCounty(e.target.value)} required style={{ width: '100%', padding: 8, margin: '10px 0' }}>
          <option value="">-- Select County --</option>
          {counties.map((c) => (
            <option key={c.code} value={c.code}>{c.name}</option>
          ))}
        </select>

        <select value={subcounty} onChange={(e) => setSubcounty(e.target.value)} required style={{ width: '100%', padding: 8, margin: '10px 0' }}>
          <option value="">-- Select Subcounty --</option>
          {subcounties.map((s) => (
            <option key={s.code} value={s.code}>{s.name}</option>
          ))}
        </select>

        <select value={ward} onChange={(e) => setWard(e.target.value)} required style={{ width: '100%', padding: 8, margin: '10px 0' }}>
          <option value="">-- Select Ward --</option>
          {wards.map((w) => (
            <option key={w.code} value={w.code}>{w.name}</option>
          ))}
        </select>

        <select value={pollingCentre} onChange={(e) => setPollingCentre(e.target.value)} required style={{ width: '100%', padding: 8, margin: '10px 0' }}>
          <option value="">-- Select Polling Centre --</option>
          {pollingCentres.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        <button type="submit" style={{ padding: '10px 20px' }}>Register & Send Link</button>
      </form>

      {status && <p style={{ marginTop: 20 }}>{status}</p>}
    </div>
  );
}
