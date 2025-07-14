// pages/callback.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../src/supabaseClient';
import sha256 from 'crypto-js/sha256';

export default function Callback() {
  const [message, setMessage] = useState('Verifying your login...');
  const router = useRouter();

  useEffect(() => {
    const verifyUser = async () => {
      try {
        // Step 1: Exchange access_token from URL fragment
        const { error: tokenError } = await supabase.auth.exchangeCodeForSession();
        if (tokenError) {
          console.error("Token exchange error:", tokenError);
          setMessage("❌ Invalid or expired link.");
          return;
        }

        // Step 2: Get session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session?.user?.email) {
          console.error("Session error:", sessionError);
          setMessage("❌ Unable to retrieve session.");
          return;
        }

        const email = session.user.email.toLowerCase();

        // Step 3: Find voter record by email
        const { data: voter, error: findError } = await supabase
          .from('voter')
          .select('*')
          .eq('email', email)
          .single();

        if (findError || !voter) {
          console.error("Voter not found:", findError);
          setMessage("❌ Voter record not found.");
          return;
        }

        const { id, username, mobile, county, subcounty, ward, polling_centre } = voter;

        // Step 4: Generate voter_hash
        const voterHash = sha256(`${email}:${mobile}:${username}`).toString();

        // Step 5: Update voter record
        const updatePayload = {
          voter_hash: voterHash,
          status: 'verified',
          email: null,
          mobile: null
        };

        const { error: updateError } = await supabase
          .from('voter')
          .update(updatePayload)
          .eq('id', id);

        if (updateError) {
          console.error("Update failed:", updateError);
          setMessage("❌ Could not update voter record.");
          return;
        }

        localStorage.removeItem('pending_registration');
        setMessage("✅ Registration complete! Redirecting...");

        setTimeout(() => router.push('/dashboard'), 2000);

      } catch (err) {
        console.error("Unexpected error:", err);
        setMessage("❌ An unexpected error occurred.");
      }
    };

    verifyUser();
  }, [router]);

  return (
    <div style={{ padding: 40, textAlign: 'center' }}>
      <h2>{message}</h2>
    </div>
  );
}
