import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../src/supabaseClient';

export default function Login() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [linkSent, setLinkSent] = useState(false);
  const [showProfileForm, setShowProfileForm] = useState(false);

  // Dropdown data
  const [counties, setCounties] = useState([]);
  const [subcounties, setSubcounties] = useState([]);
  const [wards, setWards] = useState([]);
  const [pollingCentres, setPollingCentres] = useState([]);

  const [profile, setProfile] = useState({
    mobile: '',
    county: '',
    subcounty: '',
    ward: '',
    polling_centre: ''
  });

  const router = useRouter();

  // Send magic link with redirect to login (not dashboard, so logic can run here)
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/login`
      }
    });
    if (error) {
      setMsg('Error: ' + error.message);
      setLinkSent(false);
    } else {
      setMsg('A login link has been sent! Please check your email and follow the link to continue.');
      setLinkSent(true);
    }
    setLoading(false);
  };

  const handleResend = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/login`
      }
    });
    if (error) {
      setMsg('Error: ' + error.message);
    } else {
      setMsg('A login link has been resent! Please check your email (and spam folder) to continue.');
    }
    setLoading(false);
  };

  // Handle dropdown dependencies for Complete Profile
  useEffect(() => {
    if (showProfileForm) {
      supabase.from('counties').select().then(({ data }) => setCounties(data || []));
    }
  }, [showProfileForm]);

  useEffect(() => {
    if (showProfileForm && profile.county) {
      supabase
        .from('subcounties')
        .select()
        .eq('county_code', profile.county)
        .then(({ data }) => setSubcounties(data || []));
    } else {
      setSubcounties([]);
    }
    if (!profile.county) setProfile((p) => ({ ...p, subcounty: '', ward: '', polling_centre: '' }));
  }, [showProfileForm, profile.county]);

  useEffect(() => {
    if (showProfileForm && profile.subcounty) {
      supabase
        .from('wards')
        .select()
        .eq('subcounty_code', profile.subcounty)
        .then(({ data }) => setWards(data || []));
    } else {
      setWards([]);
    }
    if (!profile.subcounty) setProfile((p) => ({ ...p, ward: '', polling_centre: '' }));
  }, [showProfileForm, profile.subcounty]);

  useEffect(() => {
    if (showProfileForm && profile.ward) {
      supabase
        .from('polling_centres')
        .select()
        .eq('ward_code', profile.ward)
        .then(({ data }) => setPollingCentres(data || []));
    } else {
      setPollingCentres([]);
    }
    if (!profile.ward) setProfile((p) => ({ ...p, polling_centre: '' }));
  }, [showProfileForm, profile.ward]);

  // After authentication, check if user is in voter table and has all required info
  useEffect(() => {
    const syncVoterTable = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check if already in voter table
      const { data: voter } = await supabase
        .from('voter')
        .select('*')
        .eq('email', user.email)
        .single();

      const meta = user.user_metadata || {};
      const allFieldsPresent =
        meta.mobile && meta.county && meta.subcounty && meta.ward && meta.polling_centre;

      if (!voter) {
        if (allFieldsPresent) {
          await supabase.from('voter').insert([{
            email: user.email,
            mobile: meta.mobile,
            county: meta.county,
            subcounty: meta.subcounty,
            ward: meta.ward,
            polling_centre: meta.polling_centre
          }]);
          router.push('/dashboard');
        } else {
          setProfile({
            mobile: meta.mobile || '',
            county: meta.county || '',
            subcounty: meta.subcounty || '',
            ward: meta.ward || '',
            polling_centre: meta.polling_centre || ''
          });
          setShowProfileForm(true);
        }
      } else {
        router.push('/dashboard');
      }
    };
    syncVoterTable();
  }, [router]);

  // Handle profile form changes
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "county" ? { subcounty: '', ward: '', polling_centre: '' } : {}),
      ...(name === "subcounty" ? { ward: '', polling_centre: '' } : {}),
      ...(name === "ward" ? { polling_centre: '' } : {})
    }));
  };

  // Handle profile form submit
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.auth.updateUser({ data: profile });
    await supabase.from('voter').upsert([{
      email: user.email,
      ...profile
    }], { onConflict: ['email'] });
    router.push('/dashboard');
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

  if (showProfileForm) {
    return (
      <div style={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #ece9f7 0%, #fff 100%)'
      }}>
        <form
          onSubmit={handleProfileSubmit}
          style={{
            background: '#fff',
            padding: '2rem',
            borderRadius: 16,
            boxShadow: '0 4px 24px rgba(0,0,0,0.17)',
            width: '100%',
            maxWidth: 400,
          }}
        >
          <h2 style={{ color: '#4733a8', marginBottom: 16 }}>Complete Your Profile</h2>
          <input
            name="mobile"
            value={profile.mobile}
            onChange={handleProfileChange}
            placeholder="Mobile"
            required
            style={dropdownStyle}
          />
          <select name="county" value={profile.county} onChange={handleProfileChange} required style={dropdownStyle}>
            <option value="">Select County</option>
            {counties.map((c) => (
              <option key={c.county_code} value={c.county_code}>{c.county_name}</option>
            ))}
          </select>
          <select name="subcounty" value={profile.subcounty} onChange={handleProfileChange} required style={dropdownStyle} disabled={!profile.county}>
            <option value="">Select Subcounty</option>
            {subcounties.map((sc) => (
              <option key={sc.subcounty_code} value={sc.subcounty_code}>{sc.subcounty_name}</option>
            ))}
          </select>
          <select name="ward" value={profile.ward} onChange={handleProfileChange} required style={dropdownStyle} disabled={!profile.subcounty}>
            <option value="">Select Ward</option>
            {wards.map((w) => (
              <option key={w.ward_code} value={w.ward_code}>{w.ward_name}</option>
            ))}
          </select>
          <select name="polling_centre" value={profile.polling_centre} onChange={handleProfileChange} required style={dropdownStyle} disabled={!profile.ward}>
            <option value="">Select Polling Centre</option>
            {pollingCentres.map((pc) => (
              <option key={pc.polling_centre_code} value={pc.polling_centre_code}>{pc.polling_centre_name}</option>
            ))}
          </select>
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '12px 0',
              borderRadius: 8,
              border: 'none',
              background: '#4f46e5',
              color: '#fff',
              fontWeight: 600,
              fontSize: '1rem',
              marginTop: 8,
              cursor: 'pointer'
            }}
          >
            Save Profile
          </button>
        </form>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Gradient background */}
      <div style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        background: 'linear-gradient(135deg, #ece9f7 0%, #fff 100%)',
        zIndex: 0
      }} />
      {/* Semi-opaque overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(42, 43, 53, 0.52)',
        zIndex: 1
      }} />
      {/* Centered login box */}
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        zIndex: 2
      }}>
        <div style={{
          maxWidth: 400,
          width: '100%',
          padding: 32,
          borderRadius: 16,
          boxShadow: '0 4px 24px rgba(0,0,0,0.17)',
          background: '#fff',
          textAlign: 'center',
          position: 'relative'
        }}>
          {/* Logo and Flag Section in a row */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 24,
            gap: 16
          }}>
            <img
              src="/ourwill-logo.png"
              alt="OurWill Logo"
              style={{
                width: 80,
                height: 'auto',
                borderRadius: 12,
                boxShadow: '0 2px 8px rgba(79,70,229,0.08)'
              }}
            />
            <img
              src="/kenya-flag.jpg"
              alt="Kenya Flag"
              style={{
                width: 48,
                height: 32,
                borderRadius: 6,
                border: '1px solid #e5e7eb',
                objectFit: 'cover',
                boxShadow: '0 2px 8px rgba(79,70,229,0.04)'
              }}
            />
          </div>
          <h2 style={{
            margin: '0 0 16px 0',
            fontWeight: 700,
            fontSize: '1.6rem',
            color: '#4733a8'
          }}>
            Login to OurWill
          </h2>
          <form onSubmit={handleLogin}>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px 16px',
                marginBottom: 16,
                borderRadius: 8,
                border: '1px solid #d1d5db',
                fontSize: '1rem',
                background: '#f7f7fa'
              }}
            />
            <button
              type="submit"
              disabled={loading || !email}
              style={{
                width: '100%',
                padding: '12px 0',
                borderRadius: 8,
                border: 'none',
                background: loading ? '#a5b4fc' : '#4f46e5',
                color: '#fff',
                fontWeight: 600,
                fontSize: '1rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s'
              }}
            >
              {loading ? 'Sending...' : 'Send Magic Link'}
            </button>
            <button
              type="button"
              disabled={loading || !linkSent || !email}
              onClick={handleResend}
              style={{
                width: '100%',
                padding: '12px 0',
                borderRadius: 8,
                border: 'none',
                background: (!linkSent || loading) ? '#d1d5db' : '#f59e42',
                color: '#fff',
                fontWeight: 600,
                fontSize: '1rem',
                cursor: (!linkSent || loading) ? 'not-allowed' : 'pointer',
                marginTop: 8,
                transition: 'background 0.2s'
              }}
            >
              Resend Magic Link
            </button>
            {msg && (
              <div style={{
                marginTop: 16,
                color: msg.startsWith('Error') ? '#dc2626' : '#4f46e5',
                fontWeight: 500
              }}>
                {msg}
              </div>
            )}
            <div style={{ marginTop: 24, color: '#555', fontSize: '0.97em', lineHeight: 1.5 }}>
              <p>
                <strong>Note:</strong> To continue, go to your email and follow the login link we sent you.
              </p>
              <p>
                If you don't see the email, check your spam or promotions folder.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
