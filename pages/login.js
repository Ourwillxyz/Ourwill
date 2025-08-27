import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import supabase from '../src/supabaseClient'; // ✅ ensure this is a default export now

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
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

  // ✅ Handle login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setMsg('Error: ' + error.message);
    } else {
      setMsg('');
    }
    setLoading(false);
  };

  // ✅ After login, check profiles table
  useEffect(() => {
    const checkProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profileRow } = await supabase
        .from('profiles')
