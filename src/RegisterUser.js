import React, { useState } from 'react';
import { supabase } from './supabaseClient';

const RegisterForm = () => {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    // Sign up with Supabase Auth
    const { user, session, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    // Insert into users table (replace 'users' with your actual table name if different)
    const { error: insertError } = await supabase.from('users').insert([
      {
        name,
        mobile, // <-- using mobile here
        email,
        auth_id: user?.id || null,
      },
    ]);
    if (insertError) {
      setError(insertError.message);
    } else {
      setSuccess('Registration successful!');
      setName('');
      setMobile('');
      setEmail('');
      setPassword('');
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleRegister}>
      <div>
        <label>Name:</label>
        <input value={name} onChange={e => setName(e.target.value)} required />
      </div>
      <div>
        <label>Mobile:</label>
        <input value={mobile} onChange={e => setMobile(e.target.value)} required />
      </div>
      <div>
        <label>Email:</label>
        <input value={email} onChange={e => setEmail(e.target.value)} required type="email" />
      </div>
      <div>
        <label>Password:</label>
        <input value={password} onChange={e => setPassword(e.target.value)} required type="password" />
      </div>
      <button type="submit" disabled={loading}>{loading ? 'Registering...' : 'Register'}</button>
      {error && <div style={{color: 'red'}}>{error}</div>}
      {success && <div style={{color: 'green'}}>{success}</div>}
    </form>
  );
};

export default RegisterForm;
