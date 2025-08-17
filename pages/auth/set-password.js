import { useState } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function SetPassword() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handleSetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      setError('You must be logged in to set a password.');
      return;
    }

    // Update password
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setError(updateError.message);
      return;
    }

    setSuccess('Password set successfully! You can now log in with your email and password.');
    // Optionally redirect to dashboard after a delay
    setTimeout(() => {
      router.replace('/dashboard');
    }, 2000);
  };

  return (
    <div style={{ maxWidth: 400, margin: "2rem auto", border: "1px solid #eee", padding: "2rem", borderRadius: 8 }}>
      <h2>Set Your Password</h2>
      <form onSubmit={handleSetPassword}>
        <label htmlFor="password">New Password</label>
        <input
          id="password"
          type="password"
          required
          minLength={8}
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Enter new password"
          style={{ width: "100%", marginBottom: 12, padding: 8 }}
        />
        <label htmlFor="confirm">Confirm Password</label>
        <input
          id="confirm"
          type="password"
          required
          minLength={8}
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          placeholder="Confirm password"
          style={{ width: "100%", marginBottom: 12, padding: 8 }}
        />
        <button type="submit" style={{ width: "100%", padding: 10 }}>
          Set Password
        </button>
      </form>
      {error && <p style={{ color: "red", marginTop: 12 }}>{error}</p>}
      {success && <p style={{ color: "green", marginTop: 12 }}>{success}</p>}
    </div>
  );
}
