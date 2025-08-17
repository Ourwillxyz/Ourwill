import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import supabase from '../src/supabaseClient';

export default function RegisterUser() {
  const [mode, setMode] = useState('register');
  const [form, setForm] = useState({
    email: '',
    mobile: '',
    county_code: '',
    subcounty_code: '',
    ward_code: '',
    polling_centre_code: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Dropdown options state
  const [counties, setCounties] = useState([]);
  const [subcounties, setSubcounties] = useState([]);
  const [wards, setWards] = useState([]);
  const [pollingCentres, setPollingCentres] = useState([]);

  const dropdownStyle = {
    width: '100%',
    padding: '0.6rem 0.8rem',
    background: '#fff',
    color: '#000',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    marginBottom: '0.8rem',
    fontSize: '1rem'
  };

  // Fetch counties on mount
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('counties')
        .select('county_code, county_name')
        .order('county_name', { ascending: true });
      if (error) {
        setErrorMsg('Error fetching counties: ' + error.message);
      }
      if (data) {
        setCounties(data);
      }
    })();
  }, []);

  // Fetch subcounties when county_code changes
  useEffect(() => {
    if (!form.county_code) {
      setSubcounties([]);
      return;
    }
    (async () => {
      const { data, error } = await supabase
        .from('subcounties')
        .select('subcounty_code, subcounty_name')
        .eq('county_code', form.county_code)
        .order('subcounty_name', { ascending: true });
      if (!error && data) setSubcounties(data);
    })();
  }, [form.county_code]);

  // Fetch wards when subcounty_code changes
  useEffect(() => {
    if (!form.subcounty_code) {
      setWards([]);
      return;
    }
    (async () => {
      const { data, error } = await supabase
        .from('wards')
        .select('ward_code, ward_name')
        .eq('subcounty_code', form.subcounty_code)
        .order('ward_name', { ascending: true });
      if (!error && data) setWards(data);
    })();
  }, [form.subcounty_code]);

  // Fetch polling centres when ward_code changes
  useEffect(() => {
    if (!form.ward_code) {
      setPollingCentres([]);
      return;
    }
    (async () => {
      const { data, error } = await supabase
        .from('polling_centres')
        .select('polling_centre_code, polling_centre_name')
        .eq('ward_code', form.ward_code)
        .order('polling_centre_name', { ascending: true });
      if (!error && data) setPollingCentres(data);
    })();
  }, [form.ward_code]);

  // Only reset dependent fields in handleChange
  function handleChange(e) {
    const { name, value } = e.target;
    if (name === 'county_code') {
      setForm(f => ({
        ...f,
        county_code: value,
        subcounty_code: '',
        ward_code: '',
        polling_centre_code: ''
      }));
    } else if (name === 'subcounty_code') {
      setForm(f => ({
        ...f,
        subcounty_code: value,
        ward_code: '',
        polling_centre_code: ''
      }));
    } else if (name === 'ward_code') {
      setForm(f => ({
        ...f,
        ward_code: value,
        polling_centre_code: ''
      }));
    } else {
      setForm(f => ({
        ...f,
        [name]: value
      }));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    // Validation
    if (mode === 'register') {
      for (const key of ['email', 'mobile', 'county_code', 'subcounty_code', 'ward_code', 'polling_centre_code']) {
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
    } else {
      if (!form.email || !form.password) {
        setErrorMsg('Enter email and password.');
        setLoading(false);
        return;
      }
      if (!form.email.match(/^[^@\s]+@[^@\s]+\.[^@\s]+$/)) {
        setErrorMsg('Enter a valid email.');
        setLoading(false);
        return;
      }
    }

    try {
      if (mode === 'register') {
        // Generate a random password for signup
        const randomPassword = uuidv4();

        // Register user with Supabase Auth (using random password)
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: form.email,
          password: randomPassword,
        });

        // Check for sign up error
        if (signUpError) {
          setErrorMsg(signUpError.message);
          setLoading(false);
          return;
        }

        // Defensive: Only proceed if user object exists
        const userId = signUpData?.user?.id;
        if (!userId) {
          setErrorMsg('Registration failed: No user object returned. Please try again or contact support.');
          setLoading(false);
          return;
        }

        // Insert user profile info
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([{
            id: userId,
            mobile: form.mobile,
            county_code: form.county_code,
            subcounty_code: form.subcounty_code,
            ward_code: form.ward_code,
            polling_centre_code: form.polling_centre_code,
          }]);

        if (profileError) {
          console.error(profileError); // <-- always log for debugging
          setErrorMsg('Registration failed while saving profile: ' + profileError.message);
          setLoading(false);
          return;
        }

        // Send password reset (recovery) email
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(form.email, {
          redirectTo: 'https://ourwill.vercel.app/reset-password',
        });

        if (resetError) {
          setErrorMsg('Error sending password setup email: ' + resetError.message);
          setLoading(false);
          return;
        }

        setSuccessMsg('Registration successful! Please check your email for a link to set your password before logging in. The link will take you to a password setup page.');
      } else {
        // Login with Supabase Auth
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        });
        if (signInError) {
          setErrorMsg(signInError.message || 'Login failed.');
          setLoading(false);
          return;
        }
        setSuccessMsg('Login successful!');
      }
    } catch (err) {
      setErrorMsg('An unexpected error occurred.');
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
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            style={dropdownStyle}
          />
          {mode === 'register' && (
            <>
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
                name="county_code"
                value={form.county_code}
                onChange={handleChange}
                required
                style={dropdownStyle}
              >
                <option value="">Select County</option>
                {counties.map(c => (
                  <option key={c.county_code} value={c.county_code}>{c.county_name}</option>
                ))}
              </select>
              {/* Subcounty Dropdown */}
              <select
                name="subcounty_code"
                value={form.subcounty_code}
                onChange={handleChange}
                required
                style={dropdownStyle}
                disabled={!form.county_code || subcounties.length === 0}
              >
                <option value="">Select Subcounty</option>
                {subcounties.map(sc => (
                  <option key={sc.subcounty_code} value={sc.subcounty_code}>{sc.subcounty_name}</option>
                ))}
              </select>
              {/* Ward Dropdown */}
              <select
                name="ward_code"
                value={form.ward_code}
                onChange={handleChange}
                required
                style={dropdownStyle}
                disabled={!form.subcounty_code || wards.length === 0}
              >
                <option value="">Select Ward</option>
                {wards.map(w => (
                  <option key={w.ward_code} value={w.ward_code}>{w.ward_name}</option>
                ))}
              </select>
              {/* Polling Centre Dropdown */}
              <select
                name="polling_centre_code"
                value={form.polling_centre_code}
                onChange={handleChange}
                required
                style={dropdownStyle}
                disabled={!form.ward_code || pollingCentres.length === 0}
              >
                <option value="">Select Polling Centre</option>
                {pollingCentres.map(pc => (
                  <option key={pc.polling_centre_code} value={pc.polling_centre_code}>{pc.polling_centre_name}</option>
                ))}
              </select>
            </>
          )}
          {mode === 'login' && (
            <input
              name="password"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
              style={dropdownStyle}
            />
          )}
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
              <strong>Note:</strong> After registering, please check your email for a link to set your password before logging in. The link will take you to a password setup page.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
