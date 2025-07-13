import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../src/supabaseClient';

export default function Callback() {
  const router = useRouter();
  const [status, setStatus] = useState('Verifying login...');

  useEffect(() => {
    const completeRegistration = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error || !session) {
        setStatus('❌ Failed to authenticate. Please try logging in again.');
        return router.push('/RegisterUser');
      }

      const user = session.user;
      const stored = localStorage.getItem('pendingVoter');

      if (!stored) {
        setStatus('⚠️ No registration data found. Please register first.');
        return router.push('/RegisterUser');
      }

      const voterData = JSON.parse(stored);

      // Save voter info into Supabase table
      const { error: insertError } = await supabase.from('voters').insert([
        {
          id: user.id,
          email: voterData.email,
          mobile: voterData.mobile,
          county_code: voterData.county_code,
          subcounty_code: voterData.subcounty_code,
          ward_code: voterData.ward_code,
          polling_centre_id: voterData.polling_centre_id,
        },
      ]);

      if (insertError) {
        console.error('Insert error:', insertError);
        setStatus('❌ Error saving registration. Please contact support.');
        return;
      }

      localStorage.removeItem('pendingVoter');
      setStatus('✅ Registration complete. Redirecting to dashboard...');
      setTimeout(() => router.push('/dashboard'), 2000);
    };

    completeRegistration();
  }, []);

  return (
    <div style={{ padding: 40 }}>
      <h2>Processing your registration...</h2>
      <p>{status}</p>
    </div>
  );
}
