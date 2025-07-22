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
    county: '',
    subcounty: '',
    ward: '',
    polling_centre: '',
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
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
      if (!formData.county) {
        setSubcounties([]);
        return;
      }
      const { data } = await supabase
        .from('subcounties')
        .select()
        .eq('county_code', formData.county);
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
      const { data } = await supabase
        .from('wards')
        .select()
        .eq('subcounty_code', formData.subcounty);
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
      const { data } = await supabase
        .from('polling_centres')
        .select()
        .eq('ward_code', formData.ward);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    // Check for duplicate mobile
    const { data: existingUser } = await supabase
      .from('voter')
      .select('id')
      .eq('mobile', formData.mobile)
      .single();

    if (existingUser) {
      setErrorMsg('This mobile number is already registered. Please use a different number or contact support.');
      setLoading(false);
      return;
    }

    // Check for existing voter profile
    const { data: existingProfile } = await supabase
      .from('voter')
      .select('id')
      .eq('id', user.id)
      .single();

    if (existingProfile) {
      setErrorMsg('Profile already exists! Redirecting...');
      setLoading(false);
      setTimeout(() => router.replace('/dashboard'), 1500);
      return;
    }

    // Insert voter profile
    const { error } = await supabase
      .from('voter')
      .insert([{
        id: user.id,
        email: user.email,
        mobile: formData.mobile,
        county: formData.county,
        subcounty: formData.subcounty,
        ward: formData.ward,
        polling_centre: formData.polling_centre,
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
          <select id="county" name="county" required value={formData.county} onChange={handleChange} style={dropdownStyle}>
            <option value="">Select County</option>
            {counties.map((c) => (
              <option key={c.county_code} value={c.county_code}>{c.county_name}</option>
            ))}
          </select>
          <select id="subcounty" name="subcounty" required value={formData.subcounty} onChange={handleChange} style={dropdownStyle}>
            <option value="">Select Subcounty</option>
            {subcounties.map((sc) => (
              <option key={sc.subcounty_code} value={sc.subcounty_code}>{sc.subcounty_name}</option>
            ))}
          </select>
          <select id="ward" name="ward" required value={formData.ward} onChange={handleChange} style={dropdownStyle}>
            <option value="">Select Ward</option>
            {wards.map((w) => (
              <option key={w.ward_code} value={w.ward_code}>{w.ward_name}</option>
            ))}
          </select>
          <select id="polling_centre" name="polling_centre" required value={formData.polling_centre} onChange={handleChange} style={dropdownStyle}>
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
