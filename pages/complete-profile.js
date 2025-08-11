import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../src/supabaseClient';

export default function CompleteProfile() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [counties, setCounties] = useState([]);
  const [subcounties, setSubcounties] = useState([]);
  const [wards, setWards] = useState([]);
  const [pollingCentres, setPollingCentres] = useState([]);
  const [formData, setFormData] = useState({
    mobile: '',
    county_code: '',
    subcounty_code: '',
    ward_code: '',
    polling_centre_code: '',
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    // Check user
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/RegisterUser');
      } else {
        setUser(user);
      }
    };
    getUser();
  }, [router]);

  useEffect(() => {
    const fetchCounties = async () => {
      const { data, error } = await supabase.from('counties').select();
      if (!error) setCounties(data || []);
    };
    fetchCounties();
  }, []);

  useEffect(() => {
    const fetchSubcounties = async () => {
      if (!formData.county_code) {
        setSubcounties([]);
        return;
      }
      const { data } = await supabase
        .from('subcounties')
        .select()
        .eq('county_code', formData.county_code);
      setSubcounties(data || []);
    };
    fetchSubcounties();
  }, [formData.county_code]);

  useEffect(() => {
    const fetchWards = async () => {
      if (!formData.subcounty_code) {
        setWards([]);
        return;
      }
      const { data } = await supabase
        .from('wards')
        .select()
        .eq('subcounty_code', formData.subcounty_code);
      setWards(data || []);
    };
    fetchWards();
  }, [formData.subcounty_code]);

  useEffect(() => {
    const fetchPollingCentres = async () => {
      if (!formData.ward_code) {
        setPollingCentres([]);
        return;
      }
      const { data } = await supabase
        .from('polling_centres')
        .select()
        .eq('ward_code', formData.ward_code);
      setPollingCentres(data || []);
    };
    fetchPollingCentres();
  }, [formData.ward_code]);

  const handleChange = (e) => {
    setErrorMsg('');
    setSuccessMsg('');
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    // Check for duplicate mobile in profiles (optional, comment out if not needed)
    const { data: existingMobile } = await supabase
      .from('profiles')
      .select('id')
      .eq('mobile', formData.mobile)
      .single();

    if (existingMobile) {
      setErrorMsg('This mobile number is already registered. Please use a different number or contact support.');
      setLoading(false);
      return;
    }

    // Check if profile already exists for this user
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    if (existingProfile) {
      setErrorMsg('Profile already exists for this user.');
      setLoading(false);
      return;
    }

    // Insert profile using Auth user.id as PK
    const { error } = await supabase
      .from('profiles')
      .insert([{
        id: user.id,
        email: user.email,
        mobile: formData.mobile,
        county_code: formData.county_code,
        subcounty_code: formData.subcounty_code,
        ward_code: formData.ward_code,
        polling_centre_code: formData.polling_centre_code,
      }]);

    if (error) {
      setErrorMsg('Failed to save profile: ' + error.message);
      setLoading(false);
      return;
    }

    setSuccessMsg('Profile completed! Redirecting...');
    setLoading(false);
    setTimeout(() => router.replace('/dashboard'), 1800);
  };

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

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Loading...</p>
      </div>
    );
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
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        padding: '2rem',
        borderRadius: '10px',
        width: '100%',
        maxWidth: '400px',
      }}>
        <h3 style={{ textAlign: 'center', marginBottom: '1rem', color: '#222' }}>
          Complete Your Voter Profile
        </h3>
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
            type="email"
            value={user.email}
            readOnly
            style={{ ...dropdownStyle, background: '#f3f4f6', color: '#888' }}
            placeholder="Email"
          />
          <input
            id="mobile"
            name="mobile"
            type="text"
            placeholder="Mobile"
            required
            value={formData.mobile}
            onChange={handleChange}
            style={dropdownStyle}
          />
          <select id="county_code" name="county_code" required value={formData.county_code} onChange={handleChange} style={dropdownStyle}>
            <option value="">Select County</option>
            {counties.map((c) => (
              <option key={c.county_code} value={c.county_code}>{c.county_name}</option>
            ))}
          </select>
          <select id="subcounty_code" name="subcounty_code" required value={formData.subcounty_code} onChange={handleChange} style={dropdownStyle}>
            <option value="">Select Subcounty</option>
            {subcounties.map((sc) => (
              <option key={sc.subcounty_code} value={sc.subcounty_code}>{sc.subcounty_name}</option>
            ))}
          </select>
          <select id="ward_code" name="ward_code" required value={formData.ward_code} onChange={handleChange} style={dropdownStyle}>
            <option value="">Select Ward</option>
            {wards.map((w) => (
              <option key={w.ward_code} value={w.ward_code}>{w.ward_name}</option>
            ))}
          </select>
          <select id="polling_centre_code" name="polling_centre_code" required value={formData.polling_centre_code} onChange={handleChange} style={dropdownStyle}>
            <option value="">Select Polling Centre</option>
            {pollingCentres.map((pc) => (
              <option key={pc.polling_centre_code} value={pc.polling_centre_code}>{pc.polling_centre_name}</option>
            ))}
          </select>
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
            {loading ? 'Saving...' : 'Submit'}
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
      </div>
    </div>
  );
}
