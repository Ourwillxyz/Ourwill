import React, { useState } from 'react';
import { supabase } from './supabaseClient';
import LocationSelector from './LocationSelector';

const RegisterUser = () => {
  const [mobile, setMobile] = useState(''); // Changed from phone to mobile
  const [pollingCentre, setPollingCentre] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pollingCentre) {
      alert('Please select your polling centre');
      return;
    }
    // Save to users table in Supabase
    const { error } = await supabase.from('users').insert([
      {
        mobile, // Use mobile here
        polling_centre_code: pollingCentre,
      }
    ]);
    if (error) {
      alert(error.message);
    } else {
      alert('Registration successful!');
      // Optional: Clear form or redirect user
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      fontSize: '1.25rem',
    }}>
      <form onSubmit={handleSubmit} style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        padding: '2rem',
        borderRadius: '8px',
        background: '#f8f9fa',
        boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
        minWidth: '340px'
      }}>
        <label style={{ fontWeight: 600 }}>Mobile Number</label>
        <input
          value={mobile}
          onChange={e => setMobile(e.target.value)}
          placeholder="Mobile number"
          required
          style={{ fontSize: '1.1rem', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <LocationSelector
          pollingCentre={pollingCentre}
          setPollingCentre={setPollingCentre}
        />
        <button
          type="submit"
          style={{
            fontSize: '1.1rem',
            padding: '0.7rem',
            background: '#3477eb',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Register
        </button>
      </form>
    </div>
  );
};

export default RegisterUser;
