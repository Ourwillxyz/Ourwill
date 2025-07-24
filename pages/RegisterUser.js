import { useState, useEffect } from 'react';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://your-supabase-url.supabase.co', // replace with your Supabase URL
  'your-anon-key' // replace with your Supabase anon key
);

export default function RegisterUser() {
  const [mode, setMode] = useState('register');
  const [form, setForm] = useState({
    name: '',
    email: '',
    mobile: '',
    county: '',
    subcounty: '',
    ward: '',
    polling_centre: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Dropdown data
  const [counties, setCounties] = useState([]);
  const [subcounties, setSubcounties] = useState([]);
  const [wards, setWards] = useState([]);
  const [pollingCentres, setPollingCentres] = useState([]);

  const dropdownStyle = {
    width: '100%',
    padding: '0.6rem 0.8rem',
    background: '#ffffff',
    color: '#000000',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    marginBottom: '0.8rem',
    fontSize: '1rem'
  };

  // Fetch counties on mount
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('county')
        .select('id, name')
        .order('name', { ascending: true });
      if (!error) setCounties(data);
    })();
  }, []);

  // Fetch subcounties when county changes
  useEffect(() => {
    if (!form.county) {
      setSubcounties([]);
      setForm(f => ({ ...f, subcounty: '', ward: '', polling_centre: '' }));
      return;
    }
    (async () => {
      const { data, error } = await supabase
        .from('subcounty')
        .select('id, name')
        .eq('county_id', form.county)
        .order('name', { ascending: true });
      if (!error) setSubcounties(data);
      setForm(f => ({ ...f, subcounty: '', ward: '', polling_centre: '' }));
    })();
  }, [form.county]);

  // Fetch wards when subcounty changes
  useEffect(() => {
    if (!form.subcounty) {
      setWards([]);
      setForm(f => ({ ...f, ward: '', polling_centre: '' }));
      return;
    }
    (async () => {
      const { data, error } = await supabase
        .from('ward')
        .select('id, name')
        .eq('subcounty_id', form.subcounty)
        .order('name', { ascending: true });
      if (!error) setWards(data);
      setForm(f => ({ ...f, ward: '', polling_centre: '' }));
    })();
  }, [form.subcounty]);

  // Fetch polling centres when ward changes
  useEffect(() => {
    if (!form.ward) {
      setPollingCentres([]);
      setForm(f => ({ ...f, polling_centre: '' }));
      return;
    }
    (async () => {
      const { data, error } = await supabase
        .from('polling_centre')
        .select('id, name')
        .eq('ward_id', form.ward)
        .order('name', { ascending: true });
      if (!error) setPollingCentres(data);
      setForm(f => ({ ...f, polling_centre: '' }));
    })();
  }, [form.ward]);

  function handleChange(e) {
    const { name, value } = e.target;
    // Reset dependent fields if parent changes
    if (name === 'county') {
      setForm(f => ({ ...f, county: value, subcounty: '', ward: '', polling_centre: '' }));
    } else if (name === 'subcounty') {
      setForm(f => ({ ...f, subcounty: value, ward: '', polling_centre: '' }));
    } else if (name === 'ward') {
      setForm(f => ({ ...f, ward: value, polling_centre: '' }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    for (const key in form) {
      if (!form[key]) {
        setErrorMsg('Please fill all fields.');
        setLoading(false);
        return;
      }
    }
    if (!form.email.match(/^[^@\s]+@[^@\s]+\.[^@\s]+$/)) {
      setErrorMsg('Enter a valid email.');
      setLoading(false);
      return;
    }
    if (form.password.length < 6) {
      setErrorMsg('Password should be at least 6 characters.');
      setLoading(false);
      return;
    }

    try {
      if (mode === 'register') {
        const res = await axios.post('https://your-backend.onrender.com/api/register', form); 
        setSuccessMsg(res.data.message || 'Registration successful! Please verify your email/mobile.');
      } else {
        const { email, password } = form;
        const res = await axios.post('https://your-backend.onrender.com/api/login', { email, password });
        setSuccessMsg(res.data.message || 'Login successful!');
      }
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message ||
        (mode === 'register' ? 'Registration failed.' : 'Login failed.')
      );
    }
    setLoading(false);
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundImage: 'url("/kenya-flag.jpg")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      padding: '2rem',
    }}>
      <img src="/ourwill-logo.png" alt="OurWill Logo" style={{ width: '180px', marginBottom: '1.5rem' }} />
      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: '2rem',
        borderRadius: '10px',
        width: '100%',
        maxWidth: '400px',
      }}>
        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 22, justifyContent: "center" }}>
          <button
            style={{
              flex: 1,
              padding: "10px 0",
              background: mode === "register" ? "#3b82f6" : "#ece9f7",
              color: mode === "register" ? "#fff" : "#3b82f6",
              border: "none",
              borderRadius: 8,
              fontWeight: 600,
              cursor: "pointer"
            }}
            onClick={() => { setMode("register"); setErrorMsg(""); setSuccessMsg(""); }}
          >
            Register
          </button>
          <button
            style={{
              flex: 1,
              padding: "10px 0",
              background: mode === "login" ? "#3b82f6" : "#ece9f7",
              color: mode === "login" ? "#fff" : "#3b82f6",
              border: "none",
              borderRadius: 8,
              fontWeight: 600,
              cursor: "pointer"
            }}
            onClick={() => { setMode("login"); setErrorMsg(""); setSuccessMsg(""); }}
          >
            Login
          </button>
        </div>
        {errorMsg && <div style={{
          width: '100%',
          marginBottom: '1rem',
          color: '#ef4444',
          background: '#fee2e2',
          padding: '0.7rem',
          borderRadius: '4px',
          textAlign: 'center',
          fontSize: '0.98rem',
        }}>{errorMsg}</div>}
        <form onSubmit={handleSubmit}>
          <input
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={handleChange}
            required
            style={dropdownStyle}
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            style={dropdownStyle}
          />
          <input
            name="mobile"
            placeholder="Mobile"
            value={form.mobile}
            onChange={handleChange}
            required
            style={dropdownStyle}
          />

          {/* County Dropdown */}
          <select
            name="county"
            value={form.county}
            onChange={handleChange}
            required
            style={dropdownStyle}
          >
            <option value="">Select County</option>
            {counties.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          {/* Subcounty Dropdown */}
          <select
            name="subcounty"
            value={form.subcounty}
            onChange={handleChange}
            required
            style={dropdownStyle}
            disabled={!form.county}
          >
            <option value="">Select Subcounty</option>
            {subcounties.map(sc => (
              <option key={sc.id} value={sc.id}>{sc.name}</option>
            ))}
          </select>

          {/* Ward Dropdown */}
          <select
            name="ward"
            value={form.ward}
            onChange={handleChange}
            required
            style={dropdownStyle}
            disabled={!form.subcounty}
          >
            <option value="">Select Ward</option>
            {wards.map(w => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>

          {/* Polling Centre Dropdown */}
          <select
            name="polling_centre"
            value={form.polling_centre}
            onChange={handleChange}
            required
            style={dropdownStyle}
            disabled={!form.ward}
          >
            <option value="">Select Polling Centre</option>
            {pollingCentres.map(pc => (
              <option key={pc.id} value={pc.name}>{pc.name}</option>
            ))}
          </select>

          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
            style={dropdownStyle}
          />
          <button type="submit" disabled={loading} style={{
            width: '100%',
            padding: '0.8rem 0',
            background: '#3b82f6',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '1.05rem',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'background 0.2s',
            marginTop: '0.2rem',
            marginBottom: 8,
          }}>
            {loading
              ? (mode === 'register' ? 'Registering...' : 'Logging in...')
              : (mode === 'register' ? 'Register' : 'Login')}
          </button>
        </form>
        {successMsg && <div style={{
          width: '100%',
          marginTop: '1rem',
          color: '#22c55e',
          background: '#dcfce7',
          padding: '0.7rem',
          borderRadius: '4px',
          textAlign: 'center',
          fontSize: '0.98rem',
        }}>{successMsg}</div>}
        {mode === 'register' && (
          <div style={{ marginTop: '1.3rem', color: '#555', fontSize: '0.97em', lineHeight: 1.5, textAlign: 'center' }}>
            <p>
              <strong>Note:</strong> After registering, please check your email or mobile for a verification message.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
