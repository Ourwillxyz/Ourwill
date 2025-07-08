import React, { useState } from 'react';
import LocationSelector from './LocationSelector';

const RegisterUser = () => {
  const [mobile, setMobile] = useState('');
  const [pollingCentre, setPollingCentre] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Show a user-friendly message instead of attempting to insert
    setError('');
    setSuccess('');
    if (!pollingCentre) {
      setError('Please select your polling centre');
      return;
    }
    setSuccess('Registration is currently unavailable. Please contact the administrator.');
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
        {error && <div style={{ color: 'red', fontSize: '1rem' }}>{error}</div>}
        {success && <div style={{ color: 'green', fontSize: '1rem' }}>{success}</div>}
      </form>
    </div>
  );
};

export default RegisterUser;
