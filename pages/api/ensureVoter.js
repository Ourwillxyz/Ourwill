// pages/api/ensureVoter.js
import { supabase } from '../../src/supabaseClient';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { user } = req.body;

  if (!user) {
    return res.status(400).json({ error: 'Missing user data' });
  }

  // Check if the voter already exists
  const { data: existingVoter, error: fetchError } = await supabase
    .from('voter')
    .select('*')
    .eq('email', user.email)
    .single();

  if (existingVoter) {
    return res.status(200).json({ message: 'Voter already exists' });
  }

  // Insert new voter
  const { error: insertError } = await supabase.from('voter').insert([
    {
      email: user.email,
      name: user.user_metadata?.name || '',
      phone: user.phone || '',
      auth_id: user.id,
    },
  ]);

  if (insertError) {
    return res.status(500).json({ error: insertError.message });
  }

  res.status(200).json({ message: 'Voter added successfully' });
}
