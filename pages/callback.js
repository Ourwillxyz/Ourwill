// pages/callback.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../src/supabaseClient';
import sha256 from 'crypto-js/sha256';

export default function Callback() {
  const [message, setMessage] = useState('Verifying...');
  const router = useRouter();

  useEffect(() => {
    const verifyUser = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error || !session?.user) {
        setMessage('❌ Authentication failed.');
        return;
      }

      const user = session.user;

      // Get pending registration data from localStorage
      const pending = JSON.parse(localStorage.getItem('pending_registration') || '{}');

      const { email, username, mobile, county_code, subcounty_code, ward_code, polling_centre_id } = pending;

      if (!email || !username || !mobile || !county_code || !subcounty_code || !ward_code || !polling_centre_id) {
        setMessage('❌ Missing voter information. Registration failed.');
        return;
      }

      // Check for existing email
      const { data: emailUsed } = await supabase
        .from('voter')
        .select('id')
        .eq('email', email)
        .maybeSingle();
      if (emailUsed) {
        setMessage('❌ This email is already registered.');
        return;
      }

      // Check for existing mobile
      const { data: mobileUsed } = await supabase
        .from('voter')
        .select('id')
        .eq('mobile', mobile)
        .maybeSingle();
      if (mobileUsed) {
        setMessage('❌ This mobile number is already registered.');
        return;
      }

      // Check for existing username
      const { data: usernameUsed } = await supabase
        .from('voter')
        .select('id')
        .eq('username', username)
        .maybeSingle();
      if (usernameUsed) {
        setMessage('❌ This username is already taken.');
        return;
      }

      // Hash voter identity
      const voterHash = sha256(`${email}:${mobile}:${username}`).toString();

      const { error: insertError } = await supabase.from('voter').insert([{
        email,
        username,
        mobile,
        county_code,
        subcounty_code,
        ward_code,
        polling_centre: polling_centre_id,
        voter_hash: voterHash,
      }]);

      if (insertError) {
        console.error(insertError);
        setMessage('❌ Could not save voter details.');
        return;
      }

      // Clear pending data
      localStorage.removeItem('pending_registration');
      setMessage('✅ Registration complete! Redirecting...');

      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    };

    verifyUser();
  }, [router]);

  return (
    <div style={{ padding: 40, textAlign: 'center' }}>
      <h2>{message}</h2>
    </div>
  );
}
