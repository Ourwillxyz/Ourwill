// pages/RegisterUser.js

import React, { useState, useEffect } from 'react';
import { supabase } from '../src/supabaseClient';

function generateOtp() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

export default function RegisterUser() {
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
  const [step, setStep] = useState(1);
  const [info, setInfo] = useState('');
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const fetchCounties = async () => {
      const { data } = await supabase.from('counties').select('*').order('name');
      setCounties(data || []);
    };
    fetchCounties();
  }, []);

  useEffect(() => {
    if (!selectedCounty) return;
    const fetchSub = async () => {
      const { data } = await supabase.from('subcounties').select('*').eq('county_code', selectedCounty).order('name');
      setSubcounties(data || []);
    };
    fetchSub();
  }, [selectedCounty]);

  useEffect(() => {
    if (!selectedSubcounty) return;
    const fetchWards = async () => {
      const { data } = await supabase.from('wards').select('*').eq('subcounty_code', selectedSubcounty).order('name');
      setWards(data || []);
    };
    fetchWards();
  }, [selectedSubcounty]);

  useEffect(() => {
    if (!selectedWard) return;
    const fetchPCs = async () => {
      const { data } = await supabase.from('polling_centres').select('*').eq('ward_code', selectedWard).order('name');
      setPollingCentres(data || []);
    };
    fetchPCs();
  }, [selectedWard]);

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!selectedCounty || !selectedSubcounty || !selectedWard || !selectedPollingCentre) {
      setInfo('📍 Please select your full location.');
      return;
    }

    if (!mobile.startsWith('2547') || mobile.length !== 12) {
      setInfo('📱 Enter valid Kenyan mobile: e.g. 2547XXXXXXXX');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setInfo('✉️ Invalid email address.');
      return;
    }

    const { error } = await supabase.auth.signInWithOtp({ email });
    if (error) {
      setInfo('❌ Error sending magic link. Try again.');
    } else {
      setInfo('✅ Magic link sent! Check your email to continue.');
      setStep(2);
    }
  };

  return (
    <div style={{ background: '#f5f7fa', minHeight: '100vh', padding: '2rem' }}>
      <div style={{
        maxWidth: 500,
        margin: '0 auto',
        background: 'white',
        borderRadius: 12,
        padding: '2rem',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        fontFamily: 'Arial, sans-serif'
      }}>
        <h2 style={{ textAlign: 'center', marginBottom: 20 }}>🗳️ Register to Vote</h2>

        {step === 1 && (
          <form onSubmit={handleRegister}>
            <label><b>County</b><br />
              <select required value={selectedCounty} onChange={e => setSelectedCounty(e.target.value)} style={selectStyle}>
                <option value="">--Select--</option>
                {counties.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
              </select>
            </label><br />

            <label><b>Subcounty</b><br />
              <select required value={selectedSubcounty} onChange={e => setSelectedSubcounty(e.target.value)} style={selectStyle} disabled={!selectedCounty}>
                <option value="">--Select--</option>
                {subcounties.map(s => <option key={s.code} value={s.code}>{s.name}</option>)}
              </select>
            </label><br />

            <label><b>Ward</b><br />
              <select required value={selectedWard} onChange={e => setSelectedWard(e.target.value)} style={selectStyle} disabled={!selectedSubcounty}>
                <option value="">--Select--</option>
                {wards.map(w => <option key={w.code} value={w.code}>{w.name}</option>)}
              </select>
            </label><br />

            <label><b>Polling Centre</b><br />
              <select required value={selectedPollingCentre} onChange={e => setSelectedPollingCentre(e.target.value)} style={selectStyle} disabled={!selectedWard}>
                <option value="">--Select--</option>
                {pollingCentres.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </label><br />

            <label><b>Mobile Number</b><br />
              <input type="text" value={mobile} onChange={e => setMobile(e.target.value)} placeholder="e.g. 2547XXXXXXX" style={inputStyle} required />
            </label><br />

            <label><b>Email</b><br />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" style={inputStyle} required />
            </label><br />

            <button type="submit" style={buttonStyle}>Send Magic Link</button>
          </form>
        )}

        {step === 2 && (
          <div style={{ textAlign: 'center', paddingTop: 20 }}>
            <p>📨 Check your email for the magic login link.</p>
            <p>Once verified, you’ll be redirected automatically.</p>
          </div>
        )}

        {info && <div style={{ marginTop: 20, color: '#333', fontSize: '1rem' }}>{info}</div>}
      </div>
    </div>
  );
}

const selectStyle = {
  padding: '10px',
  width: '100%',
  margin: '8px 0',
  borderRadius: '6px',
  border: '1px solid #ccc'
};

const inputStyle = {
  padding: '10px',
  width: '100%',
  margin: '8px 0',
  borderRadius: '6px',
  border: '1px solid #ccc'
};

const buttonStyle = {
  padding: '12px',
  width: '100%',
  backgroundColor: '#0066cc',
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  fontSize: '1rem',
  marginTop: '1rem',
  cursor: 'pointer'
};
