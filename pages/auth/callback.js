// File: pages/auth/callback.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../src/supabaseClient';

export default function Callback() {
  const router = useRouter();
  const [msg, setMsg] = useState('Finishing login... please wait.');

  useEffect(() => {
    const finishLogin = async () => {
      try {
        // 1. Get logged-in user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          setMsg('Error retrieving user info. Redirecting to signup...');
          setTimeout(() => router.replace('/trial-email-signup'), 2000);
          return;
        }

        // 2. Check if user exists in profiles
        let { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (!profile) {
          // 3. Check voter table
          const { data: voter, error: voterError } = await supabase
            .from('voter')
            .select('*')
            .eq('auth_user_id', user.id)
            .single();

          if (voter) {
            // 4. Populate profiles from voter
            const { data: insertedProfile, error: insertError } = await supabase
              .from('profiles')
              .insert([{
                id: user.id,
                email: user.email,
                mobile: voter.mobile || '',
                county_code: voter.county || '',
                subcounty_code: voter.subcounty || '',
                ward_code: voter.ward || '',
                polling_centre_code: voter.polling_centre || ''
              }])
              .select()
              .single();

            if (insertError) {
              setMsg('Error populating profile. Please try again.');
              return;
            }

            // 5. Redirect to set-password page
            router.replace('/set-password');
            return;
          } else {
            // 6. Voter not found, redirect to trial-email-signup
            setMsg('User not found. Redirecting to signup...');
            setTimeout(() => router.replace('/trial-email-signup'), 2000);
            return;
          }
        } else {
          // Profile exists, redirect to set-password if password not set
          const { data: userDetails } = await supabase.auth.admin.getUserById(user.id);
          if (!userDetails?.password_hash) {
            router.replace('/set-password');
            return;
          }

          // Otherwise, go to dashboard
          router.replace('/dashboard');
        }
      } catch (err) {
        console.error('Callback error:', err);
        setMsg('Unexpected error. Redirecting to login...');
        setTimeout(() => router.replace('/login'), 2000);
      }
    };

    finishLogin();
  }, [router]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontSize: 18,
      fontWeight: 500
    }}>
      {msg}
    </div>
  );
}
