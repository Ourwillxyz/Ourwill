import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../src/supabaseClient';
import emailjs from '@emailjs/browser';
import sha256 from 'crypto-js/sha256';
import Image from 'next/image';

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

  const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

  const sendOtpEmail = async (email, passcode) => {
    try {
      await emailjs.send(
        'service_21itetw',
        'template_ks69v69',
        { email, passcode },
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

    const passcode = generateOtp();

    // Hash values
    const email_hash = sha256(formData.email).toString();
    const username_hash = sha256(formData.username).toString();
    const mobile_hash = sha256(formData.mobile).toString();
    const voter_hash = sha256(
      formData.username + formData.email + formData.mobile
    ).toString();

    // Store voter
    const { error } = await supabase.from('voter').insert([
      {
        email: formData.email,
        mobile: formData.mobile,
        username: formData.username,
        county: formData.county,
        subcounty: formData.subcounty,
        ward: formData.ward,
        polling_centre: formData.polling_centre,
        email_hash,
        username_hash,
        mobile_hash,
        voter_hash,
        status: 'pending',
      },
    ]);

    if (error) {
      setErrorMsg('Registration failed: ' + error.message);
      setLoading(false);
      return;
    }

    const sent = await sendOtpEmail(formData.email, passcode);
    if (!sent) {
      setLoading(false);
      return;
    }

    setSuccessMsg('OTP sent successfully! Redirecting...');
    setTimeout(() => {
      router.push({
        pathname: '/verify',
        query: {
          email: formData.email,
          mobile: formData.mobile,
        },
      });
    }, 1500);

    setLoading(false);
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <Image src="/logo.png" alt="Logo" width={80} height={80} />
        <h2>Voter Registration</h2>
        {errorMsg && <div className="error-msg">{errorMsg}</div>}
        {successMsg && <div className="success-msg">{successMsg}</div>}
        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="Email"
            required
            value={formData.email}
            onChange={handleChange}
          />
          <label htmlFor="mobile">Mobile</label>
          <input
            id="mobile"
            name="mobile"
            type="tel"
            placeholder="Mobile"
            required
            value={formData.mobile}
            onChange={handleChange}
          />
          <label htmlFor="username">Username</label>
          <input
            id="username"
            name="username"
            type="text"
            placeholder="Username"
            required
            value={formData.username}
            onChange={handleChange}
          />
          <label htmlFor="county">County</label>
          <select
            id="county"
            name="county"
            required
            value={formData.county}
            onChange={handleChange}
          >
            <option value="">Select County</option>
            {counties.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>
          <label htmlFor="subcounty">Subcounty</label>
          <select
            id="subcounty"
            name="subcounty"
            required
            value={formData.subcounty}
            onChange={handleChange}
          >
            <option value="">Select Subcounty</option>
            {subcounties.map((s) => (
              <option key={s.code} value={s.code}>
                {s.name}
              </option>
            ))}
          </select>
          <label htmlFor="ward">Ward</label>
          <select
            id="ward"
            name="ward"
            required
            value={formData.ward}
            onChange={handleChange}
          >
            <option value="">Select Ward</option>
            {wards.map((w) => (
              <option key={w.code} value={w.code}>
                {w.name}
              </option>
            ))}
          </select>
          <label htmlFor="polling_centre">Polling Centre</label>
          <select
            id="polling_centre"
            name="polling_centre"
            required
            value={formData.polling_centre}
            onChange={handleChange}
          >
            <option value="">Select Polling Centre</option>
            {pollingCentres.map((p) => (
              <option key={p.code} value={p.code}>
                {p.name}
              </option>
            ))}
          </select>
          <button type="submit" disabled={loading}>
            {loading ? 'Processing...' : 'Register'}
          </button>
        </form>
      </div>
      <style jsx>{`
        .register-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: linear-gradient(135deg, #e0e7ff 0%, #f3f4f6 100%);
        }
        .register-card {
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.08);
          padding: 2rem 2.5rem;
          max-width: 400px;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        h2 {
          margin-bottom: 1.4rem;
          color: #2d3748;
        }
        label {
          align-self: flex-start;
          margin-top: 1rem;
          margin-bottom: 0.3rem;
          color: #4a5568;
          font-size: 0.97rem;
        }
        input, select {
          width: 100%;
          padding: 0.6rem 0.8rem;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          margin-bottom: 0.8rem;
          background: #f8fafc;
          font-size: 1rem;
        }
        button {
          width: 100%;
          padding: 0.8rem 0;
          background: #3b82f6;
          color: #fff;
          border: none;
          border-radius: 6px;
          font-size: 1.05rem;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s;
        }
        button:disabled {
          background: #a5b4fc;
          cursor: not-allowed;
        }
        .error-msg {
          width: 100%;
          margin-bottom: 1rem;
          color: #ef4444;
          background: #fee2e2;
          padding: 0.7rem;
          border-radius: 4px;
          text-align: center;
          font-size: 0.98rem;
        }
        .success-msg {
          width: 100%;
          margin-bottom: 1rem;
          color: #22c55e;
          background: #dcfce7;
          padding: 0.7rem;
          border-radius: 4px;
          text-align: center;
          font-size: 0.98rem;
        }
        @media (max-width: 500px) {
          .register-card {
            padding: 1rem 0.5rem;
          }
        }
      `}</style>
    </div>
  );
}
