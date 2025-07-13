import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient'; // Adjust path if needed

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

  // Fetch counties
  useEffect(() => {
    supabase.from('counties').select('*').order('name').then(({ data, error }) => {
      if (!error) setCounties(data);
    });
  }, []);

  // Fetch subcounties
  useEffect(() => {
    if (selectedCounty) {
      supabase
        .from('subcounties')
        .select('*')
        .eq('county_code', selectedCounty)
        .order('name')
        .then(({ data, error }) => {
          if (!error) setSubcounties(data);
        });
      setSelectedSubcounty('');
      setWards([]);
      setSelectedWard('');
      setPollingCentres([]);
      setSelectedPollingCentre('');
    }
  }, [selectedCounty]);

  // Fetch wards
  useEffect(() => {
    if (selectedSubcounty) {
      supabase
        .from('wards')
        .select('*')
        .eq('subcounty_code', selectedSubcounty)
        .order('name')
        .then(({ data, error }) => {
          if (!error) setWards(data);
        });
      setSelectedWard('');
      setPollingCentres([]);
      setSelectedPollingCentre('');
    }
  }, [selectedSubcounty]);

  // Fetch polling centres
  useEffect(() => {
    if (selectedWard) {
      supabase
        .from('polling_centres')
        .select('*')
        .eq('ward_code', selectedWard)
        .order('name')
        .then(({ data, error }) => {
          if (!error) setPollingCentres(data);
        });
      setSelectedPollingCentre('');
    }
  }, [selectedWard]);

  // Handle registration + email magic link
  const handleRegister = async (e) => {
    e.preventDefault();

    if (!selectedCounty || !selectedSubcounty || !selectedWard || !selectedPollingCentre) {
      setInfo('Please select all your location details.');
      return;
    }

    if (!mobile.startsWith('2547') || mobile.length !== 12) {
      setInfo('Please enter a valid Kenyan mobile number.');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setInfo('Please enter a valid email address.');
      return;
    }

    setInfo('Sending login link to your email...');

    try {
      const res = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const result = await res.json();

      if (result.success) {
        setStep(2);
        setInfo('✅ Login link sent! Check your email.');
      } else {
        setInfo(`❌ Failed to send email: ${result.message}`);
      }
    } catch (err) {
      console.error(err);
      setInfo('❌ Network error. Please try again.');
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: '2rem auto', padding: 24, border: '1px solid #ccc', borderRadius: 8 }}>
      <h2>User Registration</h2>

      {step === 1 && (
        <form onSubmit={handleRegister}>
          <label>
            County:<br />
            <select value={selectedCounty} onChange={e => setSelectedCounty(e.target.value)} required>
              <option value="">-- Select County --</option>
              {counties.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
            </select>
          </label>
          <br /><br />

          <label>
            Subcounty:<br />
            <select value={selectedSubcounty} onChange={e => setSelectedSubcounty(e.target.value)} required disabled={!selectedCounty}>
              <option value="">-- Select Subcounty --</option>
              {subcounties.map(s => <option key={s.code} value={s.code}>{s.name}</option>)}
            </select>
          </label>
          <br /><br />

          <label>
            Ward:<br />
            <select value={selectedWard} onChange={e => setSelectedWard(e.target.value)} required disabled={!selectedSubcounty}>
              <option value="">-- Select Ward --</option>
              {wards.map(w => <option key={w.code} value={w.code}>{w.name}</option>)}
            </select>
          </label>
          <br /><br />

          <label>
            Polling Centre:<br />
            <select value={selectedPollingCentre} onChange={e => setSelectedPollingCentre(e.target.value)} required disabled={!selectedWard}>
              <option value="">-- Select Polling Centre --</option>
              {pollingCentres.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </label>
          <br /><br />

          <label>
            Mobile (e.g. 2547xxxxxxx):<br />
            <input
              type="text"
              value={mobile}
              onChange={e => setMobile(e.target.value)}
              required
              pattern="2547[0-9]{8}"
              placeholder="2547XXXXXXXX"
            />
          </label>
          <br /><br />

          <label>
            Email:<br />
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
            />
          </label>
          <br /><br />

          <button type="submit">Register & Send Login Link</button>
        </form>
      )}

      {step === 2 && (
        <div style={{ marginTop: 20, color: 'green' }}>
          ✅ A login link was sent to <strong>{email}</strong><br />
          Click the link to complete login.
        </div>
      )}

      {info && (
        <div style={{ marginTop: 20, color: info.startsWith('✅') ? 'green' : (info.startsWith('❌') ? 'red' : 'black') }}>
          {info}
        </div>
      )}
    </div>
  );
};

export default RegisterUser;
