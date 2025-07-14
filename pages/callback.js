// pages/callback.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../src/supabaseClient';
import sha256 from 'crypto-js/sha256';

export default function Callback() {
  const [message, setMessage] = useState('Verifying...');
  const router = useRouter();

  useEffect(() => {
    const verifyUser = async () => {
      try {
        // Exchange the code for a session
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession();
        if (exchangeError) {
          console.error('Exchange failed:', exchangeError.message);
          setMessage('❌ Invalid or expired link.');
          return;
        }

        // Get the authenticated session
        const { data: { session } } = await supabase.auth.getSession();
        const email = session?.user?.email;

        if (!email) {
          setMessage('❌ Could not verify session.');
          return;
        }

        // Load data from localStorage
        const pending = JSON.parse(localStorage.getItem('pending_registration') || '{}');
        const {
          username,
          mobile,
          county,
          subcounty,
          ward,
          polling_centre
        } = pending;

        if (!username || !mobile || !county || !subcounty || !ward || !polling_centre) {
          setMessage('❌ Missing registration data.');
          return;
        }

        // Check for existing voter
        const { data: exists } = await supabase
          .from('voter')
          .select('id')
          .or(`email.eq.${email},mobile.eq.${mobile},username.eq.${username}`)
          .maybeSingle();

        if (exists) {
          setMessage('❌ Already registered.');
          return;
        }

        // Generate voter_hash
        const voterHash = sha256(`${email}:${mobile}:${username}`).toString();

        // Save voter
        const { error: insertError } = await supabase.from('voter').insert([{
          username,
          email: null,
          mobile: null,
          county,
          subcounty,
          ward,
          polling_centre,
          voter_hash: voterHash,
          status: 'verified'
        }]);

        if (insertError) {
          console.error(insertError);
          setMessage('❌ Could not save voter record.');
          return;
        }

        localStorage.removeItem('pending_registration');
        setMessage('✅ Registration complete! Redirecting...');
        setTimeout(() => router.push('/dashboard'), 2000);

      } catch (e) {
        console.error('Unexpected error:', e);
        setMessage('❌ An unexpected error occurred.');
      }
    };

    if (router.isReady) {
      verifyUser();
    }
  }, [router]);

  return (
    <div style={{ padding: 40, textAlign: 'center' }}>
      <h2>{message}</h2>
    </div>
  );
}
