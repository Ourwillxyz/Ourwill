// pages/callback.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../src/supabaseClient';

const Callback = () => {
  const router = useRouter();
  const [status, setStatus] = useState('⏳ Verifying login...');

  useEffect(() => {
    const completeRegistration = async () => {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;

      if (sessionError || !user) {
        setStatus('❌ Could not verify login. Please try again.');
        return;
      }

      const metadata = JSON.parse(localStorage.getItem('pending_registration'));

      if (!metadata || !metadata.email || metadata.email !== user.email) {
        setStatus('❌ No matching registration details found.');
        return;
      }

      // Check if voter already exists
      const { data: existing, error: existingError } = await supabase
        .from('voter')
        .select('id')
        .eq('email', metadata.email)
        .single();

      if (existing && !existingError) {
        setStatus('✅ Login successful. Redirecting...');
        localStorage.removeItem('pending_registration');
        router.push('/dashboard');
        return;
      }

      // Insert new voter
      const { error: insertError } = await supabase.from('voter').insert([
        {
          email: metadata.email,
          username: metadata.username,
          mobile: metadata.mobile,
          county_code: metadata.county_code,
          subcounty_code: metadata.subcounty_code,
          ward_code: metadata.ward_code,
          polling_centre_id: metadata.polling_centre_id,
        },
      ]);

      if (insertError) {
        console.error(insertError);
        setStatus('❌ Failed to save voter data.');
      } else {
        setStatus('✅ Registration complete. Redirecting...');
        localStorage.removeItem('pending_registration');
        router.push('/dashboard');
      }
    };

    completeRegistration();
  }, [router]);

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h2>{status}</h2>
    </div>
  );
};

export default Callback;
