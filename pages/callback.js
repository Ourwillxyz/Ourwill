// pages/callback.js
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../src/supabaseClient';
import sha256 from 'crypto-js/sha256';

export default function Callback() {
  const router = useRouter();

  useEffect(() => {
    const finishLogin = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        console.error('Auth failed or user missing', error);
        return router.replace('/');
      }

      const meta = user.user_metadata || {};

      if (!meta.username || !meta.mobile || !meta.county_code || !meta.polling_centre_id) {
        console.warn('❌ Missing voter information. Registration failed.');
        return router.replace('/');
      }

      const voterHash = sha256(
        meta.username + meta.mobile + meta.county_code + meta.polling_centre_id
      ).toString();

      const { error: insertError } = await supabase.from('voter').insert({
        email: user.email,
        username: meta.username,
        mobile: meta.mobile,
        county_code: meta.county_code,
        subcounty_code: meta.subcounty_code,
        ward_code: meta.ward_code,
        polling_centre_id: meta.polling_centre_id,
        voter_hash: voterHash,
      });

      if (insertError) {
        console.error('Insert failed:', insertError);
        // Proceed anyway so they can access dashboard
      }

      router.replace('/dashboard');
    };

    finishLogin();
  }, [router]);

  return <p>Finalizing login, please wait...</p>;
}
