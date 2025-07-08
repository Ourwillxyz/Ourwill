import React, { useState } from 'react';
import { supabase } from './supabaseClient';
import LocationSelector from './LocationSelector';
import './FormVertical.css'; // Import the CSS file

const RegisterUser = () => {
  const [phone, setPhone] = useState('');
  const [pollingCentre, setPollingCentre] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pollingCentre) {
      alert('Please select your polling centre');
      return;
    }
    const { error } = await supabase.from('users').insert([
      {
        phone,
        polling_centre_code: pollingCentre,
      }
    ]);
    if (error) {
      alert(error.message);
    } else {
      alert('Registration successful!');
      setPhone('');
      setPollingCentre('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="vertical-form">
      <div className="form-group">
        <label>Phone Number</label>
        <input
          type="text"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          placeholder="Phone number"
          required
        />
      </div>
      <LocationSelector
        pollingCentre={pollingCentre}
        setPollingCentre={setPollingCentre}
      />
      <button type="submit">Register</button>
    </form>
  );
};

export default RegisterUser;
