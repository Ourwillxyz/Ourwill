// pages/callback.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../src/supabaseClient';
import sha256 from 'crypto-js/sha256';

const Callback = () => {
  const router = useRouter();
  const [status, setStatus] = useState('⏳ Verifying session...');

  useEffect(() => {
    const finishRegistration = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session?.user) {
        setStatus('❌ Authentication failed.');
        return;
      }

      const user = session.user;
      const meta = user.user_metadata;

      if (!meta || !meta.username || !meta.mobile || !meta.polling_centre_id) {
        setStatus('❌ Missing voter information. Registration failed.');
        return;
      }

      const voter_hash = sha256(`${meta.username}-${meta.polling_centre_id}`).toString();

      const { error: insertError } = await supabase.from('voter').insert({
        username: meta.username,
        mobile: meta.mobile,
        email: user.email,
        county_code: meta.county_code,
        subcounty_code: meta.subcounty_code,
        ward_code: meta.ward_code,
        polling_centre_id: meta.polling_centre_id,
        voter_hash,
      });

      if (insertError) {
        console.error(insertError);
        setStatus('❌ Could not save voter info.');
        return;
      }

      setStatus('✅ Registration complete. Redirecting...');
      setTimeout(() => router.push('/dashboard'), 2500);
    };

    finishRegistration();
  }, [router]);

  return (
    <div style={{ padding: 40, textAlign: 'center' }}>
      <h2>{status}</h2>
    </div>
  );
};

export default Callback;
