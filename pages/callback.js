import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../src/supabaseClient';
import sha256 from 'crypto-js/sha256';

export default function Callback() {
  const router = useRouter();

  useEffect(() => {
    const completeRegistration = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user?.email) {
        console.log('❌ No Supabase session found. Redirecting...');
        return router.push('/RegisterUser');
      }

      const email = session.user.email;
      const pending = localStorage.getItem('pending_registration');

      if (!pending) {
        console.log('❌ No pending voter data. Redirecting...');
        return router.push('/RegisterUser');
      }

      const voterData = JSON.parse(pending);
      const {
        username,
        mobile,
        county_code,
        subcounty_code,
        ward_code,
        polling_centre_id,
      } = voterData;

      const voter_hash = sha256(email + username + mobile).toString();

      const { error } = await supabase.from('voter').insert([
        {
          email,
          username,
          mobile,
          county: county_code,
          subcounty: subcounty_code,
          ward: ward_code,
          polling_centre: polling_centre_id,
          voter_hash,
        },
      ]);

      if (error) {
        console.error('❌ Voter insert failed:', error);
        alert('Registration failed. Please try again.');
        return router.push('/RegisterUser');
      }

      localStorage.removeItem('pending_registration');
      console.log('✅ Voter registered. Redirecting to dashboard.');
      router.push('/dashboard');
    };

    completeRegistration();
  }, [router]);

  return <p style={{ padding: 20 }}>Completing registration...</p>;
}
