import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../src/supabaseClient';

export default function RegisterUser() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: '',
    mobile: '',
    county: '',
    subcounty: '',
    ward: '',
    polling_centre: '',
  });

  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const [counties, setCounties] = useState([]);
  const [subcounties, setSubcounties] = useState([]);
  const [wards, setWards] = useState([]);
  const [pollingCentres, setPollingCentres] = useState([]);

  // Fetch counties
  useEffect(() => {
    const fetchCounties = async () => {
      const { data, error } = await supabase
        .from('counties')
        .select('code, name')
        .order('name');
      if (data) setCounties(data);
    };
    fetchCounties();
  }, []);

  // Fetch subcounties based on selected county
  useEffect(() => {
    if (!formData.county) return;
    const fetchSubcounties = async () => {
      const { data } = await supabase
        .from('subcounties')
        .select('code, name')
        .eq('county_code', formData.county)
        .order('name');
      if (data) setSubcounties(data);
    };
    fetchSubcounties();
    setSubcounties([]);
    setWards([]);
    setPollingCentres([]);
    setFormData((prev) => ({
      ...prev,
      subcounty: '',
      ward: '',
      polling_centre: '',
    }));
  }, [formData.county]);

  // Fetch wards based on selected subcounty
  useEffect(() => {
    if (!formData.subcounty) return;
    const fetchWards = async () => {
      const { data } = await supabase
        .from('wards')
        .select('code, name')
        .eq('subcounty_code', formData.subcounty)
        .order('name');
      if (data) setWards(data);
    };
    fetchWards();
    setWards([]);
    setPollingCentres([]);
    setFormData((prev) => ({
      ...prev,
      ward: '',
      polling_centre: '',
    }));
  }, [formData.subcounty]);

  // Fetch polling centres based on selected ward
  useEffect(() => {
    if (!formData.ward) return;
    const fetchPollingCentres = async () => {
      const { data } = await supabase
        .from('polling_centres')
        .select('code, name')
        .eq('ward_code', formData.ward)
        .order('name');
      if (data) setPollingCentres(data);
    };
    fetchPollingCentres();
    setPollingCentres([]);
    setFormData((prev) => ({
      ...prev,
      polling_centre: '',
    }));
  }, [formData.ward]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSendOTP = async () => {
    setLoading(true);
    const { error } = await supabase.from('voter').insert([formData]);
    if (!error) {
      setMessage('OTP sent to your mobile/email');
      setOtpSent(true);
    } else {
      setMessage('Failed to register. Please try again.');
    }
    setLoading(false);
  };

  const handleVerifyOTP = async () => {
    setLoading(true);
    if (otp === '123456') {
      setMessage('Registration complete! Redirecting...');
      setTimeout(() => {
        router.push('/Login');
      }, 2000);
    } else {
      setMessage('Invalid OTP');
    }
    setLoading(false);
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.overlay}>
        <div style={styles.container}>
          <h2 style={{ marginBottom: '1rem' }}>Voter Registration</h2>

          <input
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            style={styles.input}
          />
          <input
            name="mobile"
            placeholder="Mobile (e.g. 0712345678)"
            value={formData.mobile}
            onChange={handleChange}
            style={styles.input}
          />

          <select name="county" value={formData.county} onChange={handleChange} style={styles.input}>
            <option value="">Select County</option>
            {counties.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>

          <select name="subcounty" value={formData.subcounty} onChange={handleChange} style={styles.input} disabled={!subcounties.length}>
            <option value="">Select Subcounty</option>
            {subcounties.map((sc) => (
              <option key={sc.code} value={sc.code}>
                {sc.name}
              </option>
            ))}
          </select>

          <select name="ward" value={formData.ward} onChange={handleChange} style={styles.input} disabled={!wards.length}>
            <option value="">Select Ward</option>
            {wards.map((w) => (
              <option key={w.code} value={w.code}>
                {w.name}
              </option>
            ))}
          </select>

          <select name="polling_centre" value={formData.polling_centre} onChange={handleChange} style={styles.input} disabled={!pollingCentres.length}>
            <option value="">Select Polling Centre</option>
            {pollingCentres.map((pc) => (
              <option key={pc.code} value={pc.code}>
                {pc.name}
              </option>
            ))}
          </select>

          {!otpSent ? (
            <button onClick={handleSendOTP} style={styles.button} disabled={loading}>
              {loading ? 'Sending OTP...' : 'Register'}
            </button>
          ) : (
            <>
              <input
                name="otp"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                style={styles.input}
              />
              <button onClick={handleVerifyOTP} style={styles.button} disabled={loading}>
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
            </>
          )}

          {message && <p style={{ marginTop: '1rem' }}>{message}</p>}
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    backgroundImage: "url('/kenya-flag.jpg')",
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    minHeight: '100vh',
    minWidth: '100vw',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: '2rem',
    borderRadius: '12px',
    width: '90%',
    maxWidth: '420px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
  },
  input: {
    width: '100%',
    padding: '0.6rem',
    marginBottom: '1rem',
    borderRadius: '6px',
    border: '1px solid #ccc',
  },
  button: {
    width: '100%',
    padding: '0.8rem',
    backgroundColor: '#006400',
    color: 'white',
    fontWeight: 'bold',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
  },
};
