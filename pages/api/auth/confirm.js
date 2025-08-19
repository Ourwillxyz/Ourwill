// pages/api/auth/confirm.js
import { supabase } from '../../../src/supabaseClient';

export default async function handler(req, res) {
  const { token_hash, type, next } = req.query;

  if (!token_hash || !type) {
    return res.status(400).json({ error: 'Missing token or type' });
  }

  try {
    const { data, error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Set session cookie if you want
    // e.g., res.setHeader('Set-Cookie', `sb:token=${data.session.access_token}; Path=/; HttpOnly`);

    // Redirect after verification
    res.redirect(next || '/dashboard');
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
