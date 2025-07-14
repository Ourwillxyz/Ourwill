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
        // Step 1: Exchange the magic link token for a session
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession();
        if (exchangeError) {
          console.error('Token exchange failed:', exchangeError.message);
          setMessage('❌ Invalid or expired link.');
          return;
        }

        // Step 2: Get session details
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session?.user?.email) {
          console.error('Session error:', sessionError);
          setMessage('❌ Could not retrieve user session.');
          return;
        }

        const email = session.user.email;

        // Step 3: Get pending registration data
        const pending = JSON.parse(localStorage.getItem('pending_registration') || '{}');
        const { username, mobile, county, subcounty, ward, polling_centre } = pending;

        if (!username || !mobile || !county || !subcounty || !ward || !polling_centre) {
          setMessage('❌ Missing registration data.');
          return;
        }

        // Step 4: Create a hash of the voter identity
        const voterHash = sha256(`${email}:${mobile}:${username}`).toString();

        // Step 5: Check for existing voter using the hash
        const { data: existing } = await supabase
          .from('voter')
          .select('id')
          .eq('voter_hash', voterHash)
          .maybeSingle();

        if (existing) {
          setMessage('❌ This account is already registered.');
          return;
        }

        // Step 6: Insert new voter record
        const { error: insertError } = await supabase.from('voter').insert([{
          username,
          email: null, // Hide actual email
          mobile: null, // Hide actual mobile
          county,
          subcounty,
          ward,
          polling_centre,
          voter_hash: voterHash,
          status: 'verified'
        }]);

        if (insertError) {
          console.error('Insert error:', insertError);
          setMessage('❌ Failed to save voter record.');
          return;
        }

        // Step 7: Cleanup and redirect
        localStorage.removeItem('pending_registration');
        setMessage('✅ Registration complete! Redirecting...');
        setTimeout(() => router.push('/dashboard'), 2000);

      } catch (error) {
        console.error('Unexpected error:', error);
        setMessage('❌ Something went wrong.');
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
