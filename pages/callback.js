// pages/callback.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../src/supabaseClient';
import sha256 from 'crypto-js/sha256';

export default function Callback() {
  const router = useRouter();
  const [status, setStatus] = useState('Processing login...');

  useEffect(() => {
    const processRegistration = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error || !session) {
        setStatus('❌ Authentication failed. Try again.');
        return;
      }

      const email = session.user.email;

      // Only proceed if in browser
      if (typeof window !== 'undefined') {
        const raw = localStorage.getItem('pending_registration');

        if (!raw) {
          setStatus('❌ Missing voter information. Registration failed.');
          return;
        }

        const meta = JSON.parse(raw);
        if (!meta.username || !meta.mobile || !meta.county_code) {
          setStatus('❌ Incomplete voter information.');
          return;
        }

        const voter_hash = sha256(`${meta.username}|${meta.mobile}|${email}`).toString();

        const { error: insertError } = await supabase.from('voter').insert({
          username: meta.username,
          mobile: meta.mobile,
          email: email,
          county_code: meta.county_code,
          subcounty_code: meta.subcounty_code,
          ward_code: meta.ward_code,
          polling_centre_id: meta.polling_centre_id,
          voter_hash
        });

        if (insertError) {
          console.error('Insert failed:', insertError);
          setStatus('❌ Could not complete voter registration.');
          return;
        }

        localStorage.removeItem('pending_registration');
        setStatus('✅ Registration complete! Redirecting...');
        router.push('/dashboard');
      }
    };

    processRegistration();
  }, []);

  return (
    <div style={{ padding: 40, textAlign: 'center' }}>
      <h2>{status}</h2>
    </div>
  );
}
