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
        // Step 1: Exchange Supabase magic link token for session
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession();
        if (exchangeError) {
          console.error('Token exchange failed:', exchangeError.message);
          setMessage('❌ Invalid or expired link.');
          return;
        }

        // Step 2: Get the user session after successful login
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session?.user?.email) {
          console.error('Session error:', sessionError);
          setMessage('❌ Could not retrieve user session.');
          return;
        }

        const email = session.user.email;

        // Step 3: Retrieve pending registration from localStorage
        const pending = JSON.parse(localStorage.getItem('pending_registration') || '{}');
        const { username, mobile, county, subcounty, ward, polling_centre } = pending;

        if (!username || !mobile || !county || !subcounty || !ward || !polling_centre) {
          setMessage('❌ Missing registration data.');
          return;
        }

        // Step 4: Check if voter already exists
        const { data: existing } = await supabase
          .from('voter')
          .select('id')
          .or(`email.eq.${email},mobile.eq.${mobile},username.eq.${username}`)
          .maybeSingle();

        if (existing) {
          setMessage('❌ This account is already registered.');
          return;
        }

        // Step 5: Create voter_hash and save record
        const voterHash = sha256(`${email}:${mobile}:${username}`).toString();

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
          console.error('Insert error:', insertError);
          setMessage('❌ Failed to save voter record.');
          return;
        }

        // Step 6: Clean up and redirect
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
