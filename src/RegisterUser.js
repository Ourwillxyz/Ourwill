import React, { useState } from 'react';
import { supabase } from './supabaseClient';
import LocationSelector from './LocationSelector';

const RegisterUser = () => {
  const [phone, setPhone] = useState('');
  const [pollingCentre, setPollingCentre] = useState('');
  // Add other fields as needed, e.g. name, email

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pollingCentre) {
      alert('Please select your polling centre');
      return;
    }
    // Save to users table in Supabase
    const { error } = await supabase.from('users').insert([
      {
        phone,
        polling_centre_code: pollingCentre,
        // Add other fields here if needed
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
    <form onSubmit={handleSubmit}>
      <label>Phone Number</label>
      <input
        value={phone}
        onChange={e => setPhone(e.target.value)}
        placeholder="Phone number"
        required
      />
      <LocationSelector
        pollingCentre={pollingCentre}
        setPollingCentre={setPollingCentre}
      />
      <button type="submit">Register</button>
    </form>
  );
};

export default RegisterUser;
