import { useState, useEffect } from 'react';
import { supabase } from '../src/supabaseClient';
import Image from 'next/image';

export default function RegisterUser() {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [counties, setCounties] = useState([]);
  const [subcounties, setSubcounties] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedCounty, setSelectedCounty] = useState('');
  const [selectedSubcounty, setSelectedSubcounty] = useState('');
  const [selectedWard, setSelectedWard] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Load counties on mount
  useEffect(() => {
    const fetchCounties = async () => {
      const { data, error } = await supabase.from('counties').select('*');
      if (!error) setCounties(data);
    };
    fetchCounties();
  }, []);

  // Load subcounties when county changes
  useEffect(() => {
    if (!selectedCounty) return;
    const fetchSubcounties = async () => {
      const { data, error } = await supabase
        .from('subcounties')
        .select('*')
        .eq('county_code', selectedCounty);
      if (!error) setSubcounties(data);
    };
    fetchSubcounties();
    setSelectedSubcounty('');
    setWards([]);
  }, [selectedCounty]);

  // Load wards when subcounty changes
  useEffect(() => {
    if (!selectedSubcounty) return;
    const fetchWards = async () => {
      const { data, error } = await supabase
        .from('wards')
        .select('*')
        .eq('subcounty_code', selectedSubcounty);
      if (!error) setWards(data);
    };
    fetchWards();
    setSelectedWard('');
  }, [selectedSubcounty]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        data: { phone },
        shouldCreateUser: true,
      },
    });

    if (error) {
      setMessage('Registration failed: ' + error.message);
    } else {
      setMessage('Check your email for the login link.');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <Image
        src="/logo.png"
        alt="Logo"
        width={120}
        height={120}
        className="mb-2"
        style={{ opacity: 0.15 }}
      />
      <Image
        src="/flag.png"
        alt="Flag"
        width={160}
        height={80}
        className="mb-4"
        style={{ opacity: 0.25 }}
      />
      <h1 className="text-xl font-semibold mb-4">Register to Vote</h1>
      <form onSubmit={handleRegister} className="w-full max-w-sm space-y-3">
        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
        <input
          type="text"
          required
          placeholder="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
        <select
          required
          value={selectedCounty}
          onChange={(e) => setSelectedCounty(e.target.value)}
          className="w-full border rounded px-3 py-2"
        >
          <option value="">Select County</option>
          {counties.map((county) => (
            <option key={county.code} value={county.code}>
              {county.name}
            </option>
          ))}
        </select>
        <select
          required
          value={selectedSubcounty}
          onChange={(e) => setSelectedSubcounty(e.target.value)}
          className="w-full border rounded px-3 py-2"
          disabled={!selectedCounty}
        >
          <option value="">Select Subcounty</option>
          {subcounties.map((sc) => (
            <option key={sc.code} value={sc.code}>
              {sc.name}
            </option>
          ))}
        </select>
        <select
          required
          value={selectedWard}
          onChange={(e) => setSelectedWard(e.target.value)}
          className="w-full border rounded px-3 py-2"
          disabled={!selectedSubcounty}
        >
          <option value="">Select Ward</option>
          {wards.map((ward) => (
            <option key={ward.code} value={ward.code}>
              {ward.name}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          {loading ? 'Sending...' : 'Register'}
        </button>
      </form>
      {message && <p className="mt-4 text-center text-sm text-gray-700">{message}</p>}
    </div>
  );
}
