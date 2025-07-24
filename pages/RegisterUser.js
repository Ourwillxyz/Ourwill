import { useState } from 'react';
import axios from 'axios'; // Make sure to install axios with `npm install axios`

export default function RegisterUser() {
  const [mode, setMode] = useState('register'); // 'register' or 'login'
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

  // Dropdown styling
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

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    // Basic validation
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
        const res = await axios.post('/register', form); // Use full URL if needed
        setSuccessMsg(res.data.message || 'Registration successful! Please verify your email/mobile.');
      } else {
        // For login, you can send email+password to /login (implement backend accordingly)
        const { email, password } = form;
        const res = await axios.post('/login', { email, password });
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
          <input
            name="county"
            placeholder="County"
            value={form.county}
            onChange={handleChange}
            required
            style={dropdownStyle}
          />
          <input
            name="subcounty"
            placeholder="Subcounty"
            value={form.subcounty}
            onChange={handleChange}
            required
            style={dropdownStyle}
          />
          <input
            name="ward"
            placeholder="Ward"
            value={form.ward}
            onChange={handleChange}
            required
            style={dropdownStyle}
          />
          <input
            name="polling_centre"
            placeholder="Polling Centre"
            value={form.polling_centre}
            onChange={handleChange}
            required
            style={dropdownStyle}
          />
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
