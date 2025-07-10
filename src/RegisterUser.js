import React, { useState, useEffect } from 'react';
import { sendEmailOtp } from './helpers/sendEmailOtp';
import { supabase } from './supabaseClient'; // Adjust import if needed

function generateOtp() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

const RegisterUser = () => {
  // Location states
  const [counties, setCounties] = useState([]);
  const [subcounties, setSubcounties] = useState([]);
  const [wards, setWards] = useState([]);
  const [pollingCentres, setPollingCentres] = useState([]);

  const [selectedCounty, setSelectedCounty] = useState('');
  const [selectedSubcounty, setSelectedSubcounty] = useState('');
  const [selectedWard, setSelectedWard] = useState('');
  const [selectedPollingCentre, setSelectedPollingCentre] = useState('');

  // Registration states
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [inputOtp, setInputOtp] = useState('');
  const [step, setStep] = useState(1);
  const [info, setInfo] = useState('');
  const [verified, setVerified] = useState(false);

  // Fetch counties on mount
  useEffect(() => {
    const fetchCounties = async () => {
      const { data, error } = await supabase.from('counties').select('*').order('name');
      if (!error) setCounties(data);
    };
    fetchCounties();
  }, []);

  // Fetch subcounties when county changes
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
    } else {
      setSubcounties([]);
      setSelectedSubcounty('');
      setWards([]);
      setSelectedWard('');
      setPollingCentres([]);
      setSelectedPollingCentre('');
    }
  }, [selectedCounty]);

  // Fetch wards when subcounty changes
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
    } else {
      setWards([]);
      setSelectedWard('');
      setPollingCentres([]);
      setSelectedPollingCentre('');
    }
  }, [selectedSubcounty]);

  // Fetch polling centres when ward changes
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
    } else {
      setPollingCentres([]);
      setSelectedPollingCentre('');
    }
  }, [selectedWard]);

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!selectedCounty || !selectedSubcounty || !selectedWard || !selectedPollingCentre) {
      setInfo('Please select your location (county, subcounty, ward, polling centre).');
      return;
    }
    if (!mobile.startsWith('2547') || mobile.length !== 12) {
      setInfo('Please enter a valid Kenyan mobile number, e.g. 2547XXXXXXXXX.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setInfo('Please enter a valid email address.');
      return;
    }
    const otp = generateOtp();
    setGeneratedOtp(otp);
    setInfo('Sending OTP to your email...');
    const result = await sendEmailOtp(email, otp);
    if (result.success) {
      setStep(2);
      setInfo('OTP sent! Please check your email.');
    } else {
      setInfo('Failed to send OTP email. Please try again later.');
    }
  };

  const handleVerify = (e) => {
    e.preventDefault();
    if (inputOtp === generatedOtp) {
      setVerified(true);
      setInfo('✅ Registration successful! Your email has been verified.');
    } else {
      setInfo('❌ Incorrect OTP. Please try again.');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '2rem auto', fontSize: '1.2rem', textAlign: 'center', border: '1px solid #eee', borderRadius: 8, padding: 24 }}>
      <h2>User Registration</h2>

      {step === 1 && (
        <form onSubmit={handleRegister}>
          {/* LOCATION SELECTION */}
          <label>
            County:<br />
            <select value={selectedCounty} onChange={e => setSelectedCounty(e.target.value)} required style={{ padding: 8, width: '90%', margin: '1rem 0' }}>
              <option value="">--Select County--</option>
              {counties.map(c => <option key={c.county_code} value={c.county_code}>{c.name}</option>)}
            </select>
          </label>
          <br />
          <label>
            Subcounty:<br />
            <select value={selectedSubcounty} onChange={e => setSelectedSubcounty(e.target.value)} required disabled={!selectedCounty} style={{ padding: 8, width: '90%', margin: '1rem 0' }}>
              <option value="">--Select Subcounty--</option>
              {subcounties.map(s => <option key={s.subcounty_code} value={s.subcounty_code}>{s.name}</option>)}
            </select>
          </label>
          <br />
          <label>
            Ward:<br />
            <select value={selectedWard} onChange={e => setSelectedWard(e.target.value)} required disabled={!selectedSubcounty} style={{ padding: 8, width: '90%', margin: '1rem 0' }}>
              <option value="">--Select Ward--</option>
              {wards.map(w => <option key={w.ward_code} value={w.ward_code}>{w.name}</option>)}
            </select>
          </label>
          <br />
          <label>
            Polling Centre:<br />
            <select value={selectedPollingCentre} onChange={e => setSelectedPollingCentre(e.target.value)} required disabled={!selectedWard} style={{ padding: 8, width: '90%', margin: '1rem 0' }}>
              <option value="">--Select Polling Centre--</option>
              {pollingCentres.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </label>
          <br />

          {/* USER DETAILS */}
          <label>
            Mobile Number:<br />
            <input
              type="text"
              value={mobile}
              onChange={e => setMobile(e.target.value)}
              placeholder="e.g. 2547XXXXXXXXX"
              required
              style={{ padding: 8, width: '90%', margin: '1rem 0' }}
              disabled={step !== 1}
            />
          </label>
          <br />
          <label>
            Email Address:<br />
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="e.g. user@example.com"
              required
              style={{ padding: 8, width: '90%', margin: '1rem 0' }}
              disabled={step !== 1}
            />
          </label>
          <br />
          <button type="submit" disabled={step !== 1} style={{ padding: '8px 16px' }}>Register</button>
        </form>
      )}

      {step === 2 && !verified && (
        <form onSubmit={handleVerify}>
          <label>
            Enter OTP sent to your email:<br />
            <input
              type="text"
              value={inputOtp}
              onChange={e => setInputOtp(e.target.value)}
              required
              style={{ padding: 8, width: '90%', margin: '1rem 0' }}
              maxLength={4}
            />
          </label>
          <br />
          <button type="submit" style={{ padding: '8px 16px' }}>Verify OTP</button>
        </form>
      )}

      {verified && (
        <div style={{ color: 'green', margin: '1rem 0' }}>
          🎉 Registration complete!
        </div>
      )}

      {info && (
        <div style={{ marginTop: 16, color: info.startsWith('✅') ? 'green' : (info.startsWith('❌') ? 'red' : '#333') }}>
          {info}
        </div>
      )}
    </div>
  );
};

export default RegisterUser;
