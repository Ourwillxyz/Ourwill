// pages/callback.js
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../src/supabaseClient';
import sha256 from 'crypto-js/sha256';

export default function Callback() {
  const router = useRouter();

  useEffect(() => {
    const finishLogin = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error || !session || !session.user?.email) {
        console.error(error);
        return router.replace('/');
      }

      const meta = session.user?.user_metadata || {};

      if (!meta.username || !meta.mobile || !meta.county_code || !meta.polling_centre_id) {
        console.warn('❌ Missing voter information. Registration failed.');
        return router.replace('/');
      }

      const voterHash = sha256(
        meta.username + meta.mobile + meta.county_code + meta.polling_centre_id
      ).toString();

      const { error: insertError } = await supabase.from('voter').insert({
        email: session.user.email,
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
      }

      router.replace('/dashboard');
    };

    finishLogin();
  }, [router]);

  return <p>Finalizing login, please wait...</p>;
}
