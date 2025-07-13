import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

const RegisterUser = () => {
  const [counties, setCounties] = useState([]);
  const [subcounties, setSubcounties] = useState([]);
  const [wards, setWards] = useState([]);
  const [pollingCentres, setPollingCentres] = useState([]);

  const [selectedCounty, setSelectedCounty] = useState('');
  const [selectedSubcounty, setSelectedSubcounty] = useState('');
  const [selectedWard, setSelectedWard] = useState('');
  const [selectedPollingCentre, setSelectedPollingCentre] = useState('');

  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [info, setInfo] = useState('');
  const [step, setStep] = useState(1);

  // Load counties
  useEffect(() => {
    supabase.from('counties').select('*').order('name').then(({ data, error }) => {
      if (!error) setCounties(data);
    });
  }, []);

  useEffect(() => {
    if (selectedCounty) {
      supabase
        .from('subcounties')
        .select('*')
        .eq('county_code', selectedCounty)
        .order('name')
        .then(({ data }) => setSubcounties(data));
      setSelectedSubcounty('');
      setWards([]); setSelectedWard('');
      setPollingCentres([]); setSelectedPollingCentre('');
    }
  }, [selectedCounty]);

  useEffect(() => {
    if (selectedSubcounty) {
      supabase
        .from('wards')
        .select('*')
        .eq('subcounty_code', selectedSubcounty)
        .order('name')
        .then(({ data }) => setWards(data));
      setSelectedWard('');
      setPollingCentres([]); setSelectedPollingCentre('');
    }
  }, [selectedSubcounty]);

  useEffect(() => {
    if (selectedWard) {
      supabase
        .from('polling_centres')
        .select('*')
        .eq('ward_code', selectedWard)
        .order('name')
        .then(({ data }) => setPollingCentres(data));
      setSelectedPollingCentre('');
    }
  }, [selectedWard]);

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!selectedCounty || !selectedSubcounty || !selectedWard || !selectedPollingCentre) {
      return setInfo('❌ Please complete your location selection.');
    }
    if (!mobile.startsWith('2547') || mobile.length !== 12) {
      return setInfo('❌ Mobile number must be in format 2547XXXXXXXX.');
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      return setInfo('❌ Enter a valid email address.');
    }

    setInfo('⏳ Sending login link...');

    try {
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (result.success) {
        setStep(2);
        setInfo(`✅ Login link sent to ${email}. Please check your inbox.`);
      } else {
        setInfo(`❌ Error: ${result.message || 'Could not send magic link.'}`);
      }
    } catch (err) {
      console.error(err);
      setInfo('❌ Server error. Try again later.');
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: '2rem auto', padding: 24, border: '1px solid #ccc', borderRadius: 8 }}>
      <h2>User Registration</h2>

      {step === 1 && (
        <form onSubmit={handleRegister}>
          <label>County:<br />
            <select value={selectedCounty} onChange={e => setSelectedCounty(e.target.value)} required>
              <option value="">-- Select County --</option>
              {counties.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
            </select>
          </label><br /><br />

          <label>Subcounty:<br />
            <select value={selectedSubcounty} onChange={e => setSelectedSubcounty(e.target.value)} required disabled={!selectedCounty}>
              <option value="">-- Select Subcounty --</option>
              {subcounties.map(s => <option key={s.code} value={s.code}>{s.name}</option>)}
            </select>
          </label><br /><br />

          <label>Ward:<br />
            <select value={selectedWard} onChange={e => setSelectedWard(e.target.value)} required disabled={!selectedSubcounty}>
              <option value="">-- Select Ward --</option>
              {wards.map(w => <option key={w.code} value={w.code}>{w.name}</option>)}
            </select>
          </label><br /><br />

          <label>Polling Centre:<br />
            <select value={selectedPollingCentre} onChange={e => setSelectedPollingCentre(e.target.value)} required disabled={!selectedWard}>
              <option value="">-- Select Polling Centre --</option>
              {pollingCentres.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </label><br /><br />

          <label>Mobile:<br />
            <input
              type="text"
              value={mobile}
              onChange={e => setMobile(e.target.value)}
              placeholder="2547XXXXXXXX"
              required
            />
          </label><br /><br />

          <label>Email:<br />
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="user@example.com"
              required
            />
          </label><br /><br />

          <button type="submit">Send Magic Link</button>
        </form>
      )}

      {step === 2 && (
        <div style={{ marginTop: 20, color: 'green' }}>
          ✅ Magic login link was sent to <strong>{email}</strong>. Check your email to continue.
        </div>
      )}

      {info && (
        <div style={{ marginTop: 20, color: info.startsWith('✅') ? 'green' : (info.startsWith('❌') ? 'red' : '#333') }}>
          {info}
        </div>
      )}
    </div>
  );
};

export default RegisterUser;
