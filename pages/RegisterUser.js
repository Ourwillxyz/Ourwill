import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../src/supabaseClient';

export default function RegisterUser() {
  const router = useRouter();

  const [sessionChecked, setSessionChecked] = useState(false);
  const [counties, setCounties] = useState([]);
  const [subcounties, setSubcounties] = useState([]);
  const [wards, setWards] = useState([]);
  const [pollingCentres, setPollingCentres] = useState([]);

  const [selectedCounty, setSelectedCounty] = useState('');
  const [selectedSubcounty, setSelectedSubcounty] = useState('');
  const [selectedWard, setSelectedWard] = useState('');
  const [selectedPollingCentre, setSelectedPollingCentre] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        router.replace('/dashboard');
      } else {
        setSessionChecked(true);
      }
    };
    checkSession();
  }, []);

  useEffect(() => {
    const fetchCounties = async () => {
      const { data } = await supabase.from('counties').select('*').order('name');
      if (data) setCounties(data);
    };
    fetchCounties();
  }, []);

  useEffect(() => {
    const fetchSubcounties = async () => {
      if (selectedCounty) {
        const { data } = await supabase
          .from('subcounties')
          .select('*')
          .eq('county_code', selectedCounty)
          .order('name');
        if (data) setSubcounties(data);
      } else {
        setSubcounties([]);
        setSelectedSubcounty('');
      }
    };
    fetchSubcounties();
  }, [selectedCounty]);

  useEffect(() => {
    const fetchWards = async () => {
      if (selectedSubcounty) {
        const { data } = await supabase
          .from('wards')
          .select('*')
          .eq('subcounty_code', selectedSubcounty)
          .order('name');
        if (data) setWards(data);
      } else {
        setWards([]);
        setSelectedWard('');
      }
    };
    fetchWards();
  }, [selectedSubcounty]);

  useEffect(() => {
    const fetchPolling = async () => {
      if (selectedWard) {
        const { data } = await supabase
          .from('polling_centres')
          .select('*')
          .eq('ward_code', selectedWard)
          .order('name');
        if (data) setPollingCentres(data);
      } else {
        setPollingCentres([]);
        setSelectedPollingCentre('');
      }
    };
    fetchPolling();
  }, [selectedWard]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!email || !mobile || !selectedCounty || !selectedSubcounty || !selectedWard || !selectedPollingCentre) {
      setMessage('❌ Please fill all fields.');
      return;
    }

    // Save info temporarily to localStorage
    const payload = {
      email,
      mobile,
      county_code: selectedCounty,
      subcounty_code: selectedSubcounty,
      ward_code: selectedWard,
      polling_centre_id: selectedPollingCentre,
    };

    localStorage.setItem('pendingVoter', JSON.stringify(payload));

    // Send magic link
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/callback`,
      },
    });

    if (error) {
      console.error('Magic link error:', error);
      setMessage('❌ Failed to send verification email. Try again.');
    } else {
      setMessage('✅ Magic link sent! Please check your email.');
    }
  };

  if (!sessionChecked) {
    return (
      <div style={{ padding: 40 }}>
        <h3>Checking user session...</h3>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 500, margin: '2rem auto', padding: 24, border: '1px solid #ccc', borderRadius: 10 }}>
      <h2>📝 Voter Registration</h2>
      <form onSubmit={handleRegister}>
        <label>
          County:
          <select value={selectedCounty} onChange={(e) => setSelectedCounty(e.target.value)} required>
            <option value="">--Select--</option>
            {counties.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <br />
        <label>
          Subcounty:
          <select value={select
