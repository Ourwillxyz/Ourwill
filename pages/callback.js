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
        // Get session or fallback to getUser
        let { data: { session }, error } = await supabase.auth.getSession();
        if (!session?.user?.email) {
          const { data: { user }, error: userError } = await supabase.auth.getUser();
          if (!user?.email) {
            console.error("Auth failed:", error || userError);
            setMessage("❌ Could not verify email.");
            return;
          }
          session = { user };
        }

        const userEmail = session.user.email.toLowerCase();

        // Find voter by email (before deletion)
        const { data: voter, error: voterError } = await supabase
          .from('voter')
          .select('*')
          .ilike('email', userEmail)
          .single();

        if (voterError || !voter) {
          console.error("Voter not found:", voterError);
          setMessage("❌ Voter record not found.");
          return;
        }

        const { id, username, mobile, county, subcounty, ward, polling_centre } = voter;

        // Hash identity
        const voterHash = sha256(`${userEmail}:${mobile}:${username}`).toString();

        // Fetch location names
        const [{ data: c }, { data: sc }, { data: w }, { data: pc }] = await Promise.all([
          supabase.from('counties').select('name').eq('code', county).maybeSingle(),
          supabase.from('subcounties').select('name').eq('code', subcounty).maybeSingle(),
          supabase.from('wards').select('name').eq('code', ward).maybeSingle(),
          supabase.from('polling_centres').select('name').eq('id', polling_centre).maybeSingle(),
        ]);

        const updatePayload = {
          voter_hash: voterHash,
          status: 'verified',
          email: null,
          mobile: null,
          county_name: c?.name || '',
          subcounty_name: sc?.name || '',
          ward_name: w?.name || '',
          polling_centre_name: pc?.name || '',
        };

        const { error: updateError } = await supabase
          .from('voter')
          .update(updatePayload)
          .eq('id', id);

        if (updateError) {
          console.error("Update error:", updateError);
          setMessage("❌ Could not update voter record.");
          return;
        }

        localStorage.removeItem('pending_registration');
        setMessage("✅ Registration complete. Redirecting...");
        setTimeout(() => router.push('/dashboard'), 2000);
      } catch (err) {
        console.error("Unexpected error:", err);
        setMessage("❌ Unexpected error occurred.");
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
