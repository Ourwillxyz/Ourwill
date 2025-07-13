// pages/api/send-otp.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required.' });
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/magiclink`, {
      method: 'POST',
      headers: {
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        options: {
          emailRedirectTo: 'https://ourwill.vercel.app/auth/callback',
        },
      }),
    });

    const data = await response.json();

    if (response.ok) {
      return res.status(200).json({ success: true });
    } else {
      return res.status(500).json({
        success: false,
        message: data?.msg || data?.error_description || 'Failed to send magic link.',
      });
    }
  } catch (error) {
    console.error('Magic link error:', error);
    return res.status(500).json({ success: false, message: 'Server error while sending magic link.' });
  }
}
