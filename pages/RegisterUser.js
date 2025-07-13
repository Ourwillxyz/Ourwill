// pages/RegisterUser.js
import { useState } from 'react';
import Image from 'next/image';
import logo from '/public/ourwill-logo.png';
import { supabase } from '../src/supabaseClient';

export default function RegisterUser() {
  const [username, setUsername] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!username || username.length < 3) {
      setInfo('Username is required (min 3 characters)');
      return;
    }

    if (!/^[0-9]{9}$/.test(mobile)) {
      setInfo('Mobile must be 9 digits (e.g. 712345678)');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setInfo('Enter a valid email address');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ email });

    if (error) {
      setInfo('❌ Failed to send login link. Try again.');
    } else {
      setInfo('✅ Check your email for the magic link!');
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#fff',
      backgroundImage: 'linear-gradient(to bottom, #006600 0%, #000000 25%, #ff0000 50%, #ffffff 100%)',
      backgroundSize: '100% 10px',
      backgroundRepeat: 'no-repeat',
      paddingTop: '4rem',
      display: 'flex',
      justifyContent: 'center',
    }}>
      <div style={{
        background: '#fff',
        width: '90%',
        maxWidth: 450,
        padding: '2rem',
        borderRadius: 12,
        boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
        textAlign: 'center',
      }}>
        <Image src={logo} alt="OurWill Logo" width={120} />
        <h2 style={{ margin: '1rem 0', color: '#000' }}>Voter Access</h2>

        <form onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              marginBottom: '1rem',
              borderRadius: 6,
              border: '1px solid #ccc',
            }}
            required
          />
          <input
            type="text"
            placeholder="Mobile (e.g. 712345678)"
            value={mobile}
            onChange={e => setMobile(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              marginBottom: '1rem',
              borderRadius: 6,
              border: '1px solid #ccc',
            }}
            required
          />
          <i
