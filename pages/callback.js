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
      // Step 1: Exchange the magic link code for a session
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession();
      if (exchangeError) {
        console.error('Exchange error:', exchangeError);
        setMessage('❌ Invalid or expired link.');
        return;
      }

      // Step 2: Get session details
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session?.user?.email) {
        console.error('Session error:', sessionError);
        setMessage('❌ Authentication failed.');
        return;
      }

      const user = session.user;

      // Get pending data from localStorage
      const pending = JSON.parse(localStorage.getItem('pending_registration') || '{}');
      const {
        username,
        mobile,
        county,
        subcounty,
        ward,
        polling_centre
      } = pending;

      const email = user.email;

      if (!email || !username || !mobile || !county || !subcounty || !ward || !polling_centre) {
        setMessage('❌ Missing voter information.');
        return;
      }

      // Check if already registered
      const { data: voterExists } = await supabase
        .from('voter')
        .select('id')
        .or(`email.eq.${email},mobile.eq.${mobile},username.eq.${username}`)
        .maybeSingle();

      if (voterExists) {
        setMessage('❌ This account is already registered.');
        return;
      }

      // Hash the identity (privacy-first approach)
      const voterHash = sha256(`${email}:${mobile}:${username}`).toString();

      // Insert into voter table
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
        setMessage('❌ Could not update voter record.');
        return;
      }

      // Clear localStorage
      localStorage.removeItem('pending_registration');

      setMessage('✅ Registration complete! Redirecting...');
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    };

    verifyUser();
  }, [router]);

  return (
    <div style={{ padding: 40, textAlign: 'center' }}>
      <h2>{message}</h2>
    </div>
  );
}
