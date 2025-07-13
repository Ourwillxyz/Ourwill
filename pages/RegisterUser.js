import React, { useState, useEffect } from 'react';
import { sendEmailOtp } from '../src/helpers/sendEmailOtp';
import { supabase } from '../src/supabaseClient';

function generateOtp() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

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
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [inputOtp, setInputOtp] = useState('');
  const [step, setStep] = useState(1);
  const [info, setInfo] = useState('');
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const fetchCounties = async () => {
      const { data, error } = await supabase.from('counties').select('*').order('name');
      if (!error) setCounties(data);
    };
    fetchCounties();
  }, []);

  useEffect(() => {
    if (selectedCounty) {
      const fetchSubcounties = async () => {
        const { data, error } = await supabase
          .from('subcounties')
          .select('*')
          .eq('county_code', selectedCounty)
          .order('name');
        if (!error) setSubcounties(data);
        setSelectedSubcounty('');
        setWards([]);
        setSelectedWard('');
        setPollingCentres([]);
        setSelectedPollingCentre('');
      };
      fetchSubcounties();
    }
  }, [selectedCounty]);

  useEffect(() => {
    if (selectedSubcounty) {
      const fetchWards = async () => {
        const { data, error } = await supabase
          .from('wards')
          .select('*')
          .eq('subcounty_code', selectedSubcounty)
          .order('name');
        if (!error) setWards(data);
        setSelectedWard('');
        setPollingCentres([]);
        setSelectedPollingCentre('');
      };
      fetchWards();
    }
  }, [selectedSubcounty]);

  useEffect(() => {
    if (selectedWard) {
      const fetchPollingCentres = async () => {
        const { data, error } = await supabase
          .from('polling_centres')
          .select('*')
          .eq('ward_code', selectedWard)
          .order('name');
        if (!error) setPollingCentres(data);
        setSelectedPollingCentre('');
      };
      fetchPollingCentres();
    }
  }, [selectedWard]);

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!selectedCounty || !selectedSubcounty || !selectedWard || !selectedPollingCentre) {
      setInfo('⚠️ Please select your location.');
      return;
    }
    if (!mobile.startsWith('2547') || mobile.length !== 12) {
      setInfo('⚠️ Enter valid Kenyan mobile e.g. 2547XXXXXXXX');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setInfo('⚠️ Enter valid email address.');
      return;
    }

    const otp = generateOtp();
    setGeneratedOtp(otp);
    setInfo('📤 Sending OTP to your email...');
    const result = await sendEmailOtp(email, otp);

    if (result.success) {
      setStep(2);
      setInfo('✅ OTP sent! Check your email.');
    } else {
      setInfo('❌ Failed to send OTP.');
    }
  };

  const handleVerify = (e) => {
    e.preventDefault();
    if (inputOtp === generatedOtp) {
      setVerified(true);
      setInfo('🎉 Registration complete!');
    } else {
      setInfo('❌ Incorrect OTP.');
    }
  };

  return (
    <div style={{
      maxWidth: 500,
      margin: '2rem auto',
      padding: '2rem',
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
      fontFamily: 'Segoe UI, sans-serif'
    }}>
      {/* Logo and brand */}
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <img src="/ourwill-logo.png" alt="OurWill Logo" style={{ width: 80, marginBottom: 10 }} />
        <h2 style={{ fontWeight: 'bold', fontSize: '1.8rem', marginBottom: '0.5rem' }}>OurWill</h2>
        <p style={{ color: '#666', marginTop: 0 }}>🗳️ Register to vote, verify via email</p>
      </div>

      {/* STEP 1: Register */}
      {step === 1 && (
        <form onSubmit={handleRegister}>
          <label>County:
            <select value={selectedCounty} onChange={e => setSelectedCounty(e.target.value)} required style={inputStyle}>
              <option value="">--Select County--</option>
              {counties.map(c => (
                <option key={c.code} value={c.code}>{c.name}</option>
              ))}
            </select>
          </label>

          <label>Subcounty:
            <select value={selectedSubcounty} onChange={e => setSelectedSubcounty(e.target.value)} required disabled={!selectedCounty} style={inputStyle}>
              <option value="">--Select Subcounty--</option>
              {subcounties.map(s => (
                <option key={s.code} value={s.code}>{s.name}</option>
              ))}
            </select>
          </label>

          <label>Ward:
            <select value={selectedWard} onChange={e => setSelectedWard(e.target.value)} required disabled={!selectedSubcounty} style={inputStyle}>
              <option value="">--Select Ward--</option>
              {wards.map(w => (
                <option key={w.code} value={w.code}>{w.name}</option>
              ))}
            </select>
          </label>

          <label>Polling Centre:
            <select value={selectedPollingCentre} onChange={e => setSelectedPollingCentre(e.target.value)} required disabled={!selectedWard} style={inputStyle}>
              <option value="">--Select Centre--</option>
              {pollingCentres.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </label>

          <label>Mobile Number:
            <input type="text" value={mobile} onChange={e => setMobile(e.target.value)} placeholder="e.g. 2547XXXXXX" required style={inputStyle} />
          </label>

          <label>Email Address:
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="e.g. name@example.com" required style={inputStyle} />
          </label>

          <button type="submit" style={buttonStyle}>Send OTP</button>
        </form>
      )}

      {/* STEP 2: Verify */}
      {step === 2 && !verified && (
        <form onSubmit={handleVerify}>
          <label>Enter OTP sent to your email:
            <input type="text" value={inputOtp} onChange={e => setInputOtp(e.target.value)} required maxLength={4} style={inputStyle} />
          </label>
          <button type="submit" style={buttonStyle}>Verify</button>
        </form>
      )}

      {/* SUCCESS */}
      {verified && (
        <p style={{ color: 'green', fontWeight: 'bold', textAlign: 'center' }}>✅ You’re verified!</p>
      )}

      {/* Feedback */}
      {info && (
        <div style={{ marginTop: '1rem', color: info.startsWith('✅') ? 'green' : (info.startsWith('❌') ? 'red' : '#555') }}>
          {info}
        </div>
      )}
    </div>
  );
};

const inputStyle = {
  width: '100%',
  padding: '10px',
  margin: '10px 0 20px',
  borderRadius: '6px',
  border: '1px solid #ddd'
};

const buttonStyle = {
  padding: '10px 20px',
  backgroundColor: '#007bff',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  width: '100%'
};

export default RegisterUser;
