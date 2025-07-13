// pages/callback.js
import { useEffect, useState } from 'react';
import { supabase } from '../src/supabaseClient';
import { useRouter } from 'next/router';
import sha256 from 'crypto-js/sha256';

export default function Callback() {
  const [message, setMessage] = useState('🔄 Verifying login...');
  const router = useRouter();

  useEffect(() => {
    const processRegistration = async (user) => {
      const meta = JSON.parse(localStorage.getItem('pending_registration') || '{}');
      const {
        email,
        username,
        mobile,
        county_code,
        subcounty_code,
        ward_code,
        polling_centre_id,
      } = meta;

      if (!username || !mobile || !county_code || !subcounty_code || !ward_code || !polling_centre_id) {
        setMessage('❌ Missing voter information. Registration failed.');
        return;
      }

      const voter_hash = sha256(`${username}-${mobile}`).toString();

      const { error: insertError } = await supabase.from('voter').insert({
        username,
        mobile,
        county_code,
        subcounty_code,
        ward_code,
        polling_centre_id,
        voter_hash,
      });

      if (insertError) {
        console.error('Insert error:', insertError);
        setMessage('❌ Could not save voter info. It may already exist.');
        return;
      }

      localStorage.removeItem('pending_registration');
      setMessage('✅ Registration complete! Redirecting to dashboard...');
      setTimeout(() => router.push('/dashboard'), 2000);
    };

    // Wait for auth state change
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setMessage('✅ Login successful! Saving your voter info...');
        await processRegistration(session.user);
      }
    });

    // Also try once directly
    const tryImmediateUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (data?.user) {
        setMessage('✅ Login detected! Saving your voter info...');
        await processRegistration(data.user);
      }
    };

    tryImmediateUser();

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h2>{message}</h2>
    </div>
  );
}
