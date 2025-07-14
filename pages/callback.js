// pages/callback.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../src/supabaseClient';

export default function Callback() {
  const [message, setMessage] = useState('Verifying your login...');
  const router = useRouter();

  useEffect(() => {
    const verifyUser = async () => {
      try {
        // Step 1: Get auth session or fallback
        let {
          data: { session },
          error: sessionError
        } = await supabase.auth.getSession();

        if (!session?.user?.email) {
          const { data: { user }, error: userError } = await supabase.auth.getUser();
          if (!user?.email) {
            setMessage('❌ Could not authenticate user.');
            return;
          }
          session = { user };
        }

        const userEmail = session.user.email.toLowerCase();
        console.log("Verified email:", userEmail);

        // Step 2: Fetch voter by email (case-insensitive)
        const { data: voter, error: voterError } = await supabase
          .from('voter')
          .select('*')
          .ilike('email', userEmail)
          .single();

        if (voterError || !voter) {
          console.error("Voter not found:", voterError);
          setMessage('❌ Voter record not found.');
          return;
        }

        const { id, county, subcounty, ward, polling_centre } = voter;

        // Step 3: Resolve location names
        const [{ data: c }, { data: sc }, { data: w }, { data: pc }] = await Promise.all([
          supabase.from('counties').select('name').eq('code', county).maybeSingle(),
          supabase.from('subcounties').select('name').eq('code', subcounty).maybeSingle(),
          supabase.from('wards').select('name').eq('code', ward).maybeSingle(),
          supabase.from('polling_centres').select('name').eq('id', polling_centre).maybeSingle(),
        ]);

        const county_name = c?.name || '';
        const subcounty_name = sc?.name || '';
        const ward_name = w?.name || '';
        const polling_centre_name = pc?.name || '';

        console.log("Resolved names:", { county_name, subcounty_name, ward_name, polling_centre_name });

        // Step 4: Update that exact voter using their unique ID
        const { error: updateError } = await supabase
          .from('voter')
          .update({
            status: 'verified',
            county_name,
            subcounty_name,
            ward_name,
            polling_centre_name,
          })
          .eq('id', id); // Use unique ID for update

        if (updateError) {
          console.error("Update failed:", updateError);
          setMessage('❌ Failed to update voter.');
          return;
        }

        localStorage.removeItem('pending_registration');
        setMessage('✅ Verified and updated. Redirecting...');
        setTimeout(() => router.push('/dashboard'), 2000);
      } catch (err) {
        console.error("Unexpected error:", err);
        setMessage('❌ Unexpected error occurred.');
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
