import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../src/supabaseClient';
import emailjs from '@emailjs/browser';

export default function RegisterUser() {
  const router = useRouter();

  const [counties, setCounties] = useState([]);
  const [subcounties, setSubcounties] = useState([]);
  const [wards, setWards] = useState([]);
  const [pollingCentres, setPollingCentres] = useState([]);
  const [formData, setFormData] = useState({
    email: '',
    mobile: '',
    username: '',
    county: '',
    subcounty: '',
    ward: '',
    polling_centre: '',
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const fetchCounties = async () => {
      const { data, error } = await supabase.from('counties').select();
      if (error) {
        setErrorMsg('Failed to fetch counties');
        return;
      }
      setCounties(data || []);
    };
    fetchCounties();
  }, []);

  useEffect(() => {
    const fetchSubcounties = async () => {
      if (!formData.county) {
        setSubcounties([]);
        return;
      }
      const { data, error } = await supabase
        .from('subcounties')
        .select()
        .eq('county_code', formData.county);
      if (error) {
        setErrorMsg('Failed to fetch subcounties');
        return;
      }
      setSubcounties(data || []);
    };
    fetchSubcounties();
  }, [formData.county]);

  useEffect(() => {
    const fetchWards = async () => {
      if (!formData.subcounty) {
        setWards([]);
        return;
      }
      const { data, error } = await supabase
        .from('wards')
        .select()
        .eq('subcounty_code', formData.subcounty);
      if (error) {
        setErrorMsg('Failed to fetch wards');
        return;
      }
      setWards(data || []);
    };
    fetchWards();
  }, [formData.subcounty]);

  useEffect(() => {
    const fetchPollingCentres = async () => {
      if (!formData.ward) {
        setPollingCentres([]);
        return;
      }
      const { data, error } = await supabase
        .from('polling_centres')
        .select()
        .eq('ward_code', formData.ward);
      if (error) {
        setErrorMsg('Failed to fetch polling centres');
        return;
      }
      setPollingCentres(data || []);
    };
    fetchPollingCentres();
  }, [formData.ward]);

  const handleChange = (e) => {
    setErrorMsg('');
    setSuccessMsg('');
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Generate a 6-digit OTP
  const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

  // Send OTP via EmailJS
  const sendOtpEmail = async (email, otp) => {
    try {
      await emailjs.send(
        'service_21itetw',
        'template_ks69v69',
        { email, passcode: otp },
        'OrOyy74P28MfrgPhr'
      );
      return true;
    } catch (err) {
      setErrorMsg('Failed to send OTP email');
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    // Check for duplicate mobile
    const { data: existingUser } = await supabase
      .from('voter')
      .select('id')
      .eq('mobile', formData.mobile)
      .single();

    if (existingUser) {
      setErrorMsg('This mobile number is already registered. Please use a different number or try logging in.');
      setLoading(false);
      return;
    }

    const otp = generateOtp();

    // Store voter data with status 'pending' and save OTP (plain text, not hash!)
    const { error } = await supabase.from('voter').insert([
      {
        email: formData.email,
        mobile: formData.mobile,
        username: formData.username,
        county: formData.county,
        subcounty: formData.subcounty,
        ward: formData.ward,
        polling_centre: formData.polling_centre,
        otp, // Store plain OTP value here
        status: 'pending',
      },
    ]);

    if (error) {
      setErrorMsg('Registration failed: ' + error.message);
      setLoading(false);
      return;
    }

    const sent = await sendOtpEmail(formData.email, otp);
    if (!sent) {
      setLoading(false);
      return;
    }

    setSuccessMsg('OTP sent successfully! Redirecting to verification...');
    setTimeout(() => {
      router.push({
        pathname: '/verify',
        query: {
          email: formData.email,
          mobile: formData.mobile,
          mode: 'register',
        },
      });
    }, 1500);

    setLoading(false);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundImage: 'url("/kenya-flag.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        padding: '2rem',
      }}
    >
      <img src="/ourwill-logo.png" alt="OurWill Logo" style={{ width: '180px', marginBottom: '1.5rem' }} />

      <div
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          padding: '2rem',
          borderRadius: '10px',
          width: '100%',
          maxWidth: '400px',
        }}
      >
        <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Voter Registration</h2>
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
        {successMsg && <div style={{
          width: '100%',
          marginBottom: '1rem',
          color: '#22c55e',
          background: '#dcfce7',
          padding: '0.7rem',
          borderRadius: '4px',
          textAlign: 'center',
          fontSize: '0.98rem',
        }}>{successMsg}</div>}
        <form onSubmit={handleSubmit}>
          {/* ...form fields unchanged... */}
          <label htmlFor="email" style={{ display: 'block', marginTop: '1rem', marginBottom: '0.3rem', color: '#4a5568', fontSize: '0.97rem' }}>Email</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="Email"
            required
            value={formData.email}
            onChange={handleChange}
            style={{ width: '100%', padding: '0.6rem 0.8rem', border: '1px solid #cbd5e1', borderRadius: '6px', marginBottom: '0.8rem', background: '#f8fafc', fontSize: '1rem' }}
          />
          {/* ...other form fields for mobile, username, county, subcounty, ward, polling_centre... */}
          <button
            type="submit"
            disabled={loading}
            style={{
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
              marginTop: '1rem',
            }}
          >
            {loading ? 'Processing...' : 'Register'}
          </button>
        </form>
      </div>
    </div>
  );
}
