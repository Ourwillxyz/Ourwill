import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../src/supabaseClient';

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

    // Check for duplicate email
    const { data: existingEmailUser } = await supabase
      .from('voter')
      .select('id')
      .eq('email', formData.email)
      .single();

    if (existingEmailUser) {
      setErrorMsg('This email is already registered. Please use a different email or try logging in.');
      setLoading(false);
      return;
    }

    // Send Magic Link for registration via Supabase, including voter metadata!
    const { error } = await supabase.auth.signInWithOtp({
      email: formData.email,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: {
          mobile: formData.mobile,
          username: formData.username,
          county: formData.county,
          subcounty: formData.subcounty,
          ward: formData.ward,
          polling_centre: formData.polling_centre,
        },
      },
    });

    if (error) {
      setErrorMsg('Failed to send registration link: ' + error.message);
      setLoading(false);
      return;
    }

    setSuccessMsg('A registration link has been sent! Please check your email and follow the link to continue.');
    setLoading(false);
    // Do NOT redirect. User must check email and click the magic link.
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
          <label htmlFor="email" style={{ display: 'block', marginTop: '1rem', marginBottom: '0.3rem', color: '#4a5568', fontSize: '0.97rem' }}>Email</label>
          <input id="email" name="email" type="email" placeholder="Email" required value={formData.email} onChange={handleChange} style={{ ...dropdownStyle }} />
          <label htmlFor="mobile" style={{ display: 'block', marginBottom: '0.3rem', color: '#4a5568', fontSize: '0.97rem' }}>Mobile</label>
          <input id="mobile" name="mobile" type="text" placeholder="Mobile" required value={formData.mobile} onChange={handleChange} style={{ ...dropdownStyle }} />
          <label htmlFor="username" style={{ display: 'block', marginBottom: '0.3rem', color: '#4a5568', fontSize: '0.97rem' }}>Username</label>
          <input id="username" name="username" type="text" placeholder="Username" required value={formData.username} onChange={handleChange} style={{ ...dropdownStyle }} />
          <label htmlFor="county" style={{ display: 'block', marginBottom: '0.3rem', color: '#4a5568', fontSize: '0.97rem' }}>County</label>
          <select id="county" name="county" required value={formData.county} onChange={handleChange} style={{ ...dropdownStyle }}>
            <option value="" style={{ background: '#ffffff', color: '#000000' }}>Select County</option>
            {counties.map((c) => (
              <option key={c.county_code} value={c.county_code} style={{ background: '#ffffff', color: '#000000' }}>
                {c.county_name}
              </option>
            ))}
          </select>
          <label htmlFor="subcounty" style={{ display: 'block', marginBottom: '0.3rem', color: '#4a5568', fontSize: '0.97rem' }}>Subcounty</label>
          <select id="subcounty" name="subcounty" required value={formData.subcounty} onChange={handleChange} style={{ ...dropdownStyle }}>
            <option value="" style={{ background: '#ffffff', color: '#000000' }}>Select Subcounty</option>
            {subcounties.map((sc) => (
              <option key={sc.subcounty_code} value={sc.subcounty_code} style={{ background: '#ffffff', color: '#000000' }}>
                {sc.subcounty_name}
              </option>
            ))}
          </select>
          <label htmlFor="ward" style={{ display: 'block', marginBottom: '0.3rem', color: '#4a5568', fontSize: '0.97rem' }}>Ward</label>
          <select id="ward" name="ward" required value={formData.ward} onChange={handleChange} style={{ ...dropdownStyle }}>
            <option value="" style={{ background: '#ffffff', color: '#000000' }}>Select Ward</option>
            {wards.map((w) => (
              <option key={w.ward_code} value={w.ward_code} style={{ background: '#ffffff', color: '#000000' }}>
                {w.ward_name}
              </option>
            ))}
          </select>
          <label htmlFor="polling_centre" style={{ display: 'block', marginBottom: '0.3rem', color: '#4a5568', fontSize: '0.97rem' }}>Polling Centre</label>
          <select id="polling_centre" name="polling_centre" required value={formData.polling_centre} onChange={handleChange} style={{ ...dropdownStyle }}>
            <option value="" style={{ background: '#ffffff', color: '#000000' }}>Select Polling Centre</option>
            {pollingCentres.map((pc) => (
              <option key={pc.polling_centre_code} value={pc.polling_centre_code} style={{ background: '#ffffff', color: '#000000' }}>
                {pc.polling_centre_name}
              </option>
            ))}
          </select>
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
            marginTop: '1rem',
          }}>
            {loading ? 'Processing...' : 'Register'}
          </button>
        </form>
        <div style={{ marginTop: '1.3rem', color: '#555', fontSize: '0.97em', lineHeight: 1.5, textAlign: 'center' }}>
          <p>
            <strong>Note:</strong> To continue, go to your email and follow the registration link we sent you.
          </p>
          <p>
            If you don't see the email, check your spam or promotions folder.
          </p>
        </div>
      </div>
    </div>
  );
}
