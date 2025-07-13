// pages/callback.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../src/supabaseClient';
import sha256 from 'crypto-js/sha256';

const Callback = () => {
  const [message, setMessage] = useState('⏳ Verifying...');
  const router = useRouter();

  useEffect(() => {
    const processCallback = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error || !session?.user) {
        setMessage('❌ Authentication failed.');
        return;
      }

      const stored = localStorage.getItem('pending_registration');
      if (!stored) {
        setMessage('❌ Missing voter information. Registration failed.');
        return;
      }

      const {
        email,
        username,
        mobile,
        county_code,
        subcounty_code,
        ward_code,
        polling_centre_id
      } = JSON.parse(stored);

      // Check for duplicates
      const { data: existing, error: checkError } = await supabase
        .from('voter')
        .select('id')
        .or(`email.eq.${email},mobile.eq.${mobile},username.eq.${username}`)
        .maybeSingle();

      if (checkError) {
        console.error('Check error:', checkError);
        setMessage('❌ Error checking duplicates.');
        return;
      }

      if (existing) {
        setMessage('❌ This email, phone, or username is already registered.');
        return;
      }

      // Proceed to insert
      const voter_hash = sha256(email + mobile).toString();
      const { error: insertError } = await supabase.from('voter').insert([{
        email,
        username,
        mobile,
        county_code,
        subcounty_code,
        ward_code,
        polling_centre: polling_centre_id,
        voter_hash,
        status: 'pending'
      }]);

      if (insertError) {
        console.error(insertError);
        setMessage('❌ Failed to complete registration.');
        return;
      }

      localStorage.removeItem('pending_registration');
      setMessage('✅ Registration complete! Redirecting to dashboard...');
      setTimeout(() => router.push('/dashboard'), 3000);
    };

    processCallback();
  }, [router]);

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h2>{message}</h2>
    </div>
  );
};

export default Callback;
