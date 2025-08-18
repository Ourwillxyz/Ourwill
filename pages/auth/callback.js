// pages/auth/callback.js
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../src/supabaseClient';

export default function Callback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuth = async () => {
      try {
        // Wait for Supabase session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session) {
          console.error('No session found', sessionError);
          router.push('/trial-email-signup');
          return;
        }

        // Add slight delay to allow trigger → voter insert to complete
        await new Promise(resolve => setTimeout(resolve, 1500));

        const user = session.user;

        // Check in voter table directly
        const { data: voter, error: voterError } = await supabase
          .from('voter')
          .select('*')
          .eq('email', user.email)
          .single();

        if (voterError) {
          console.error('Error fetching voter:', voterError.message);
          router.push('/trial-email-signup');
          return;
        }

        // Redirect logic
        if (voter && voter.status === 'pending') {
          router.push('/set-password');
        } else {
          router.push('/');
        }

      } catch (err) {
        console.error('Unexpected error:', err.message);
        router.push('/trial-email-signup');
      }
    };

    handleAuth();
  }, [router]);

  return <p>Processing login, please wait...</p>;
}
