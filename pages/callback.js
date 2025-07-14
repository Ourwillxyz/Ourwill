// pages/callback.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../src/supabaseClient';

export default function Callback() {
  const [message, setMessage] = useState('Verifying your login...');
  const router = useRouter();

  useEffect(() => {
    const verifyUser = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error || !session?.user) {
        setMessage('❌ Authentication failed. Please try again.');
        return;
      }

      const userEmail = session.user.email;
      if (!userEmail) {
        setMessage('❌ No email found in session.');
        return;
      }

      // 1. Find the matching voter
      const { data: voter, error: voterError } = await supabase
        .from('voter')
        .select('*')
        .eq('email', userEmail)
        .single();

      if (voterError || !voter) {
        setMessage('❌ Voter record not found.');
        return;
      }

      const { county, subcounty, ward, polling_centre } = voter;

      // 2. Fetch names based on codes
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

      // 3. Update the voter with readable names and verified status
      const { error: updateError } = await supabase
        .from('voter')
        .update({
          status: 'verified',
          county_name,
          subcounty_name,
          ward_name,
          polling_centre_name,
        })
        .eq('email', userEmail);

      if (updateError) {
        console.error(updateError);
        setMessage('❌ Failed to update voter location names.');
        return;
      }

      localStorage.removeItem('pending_registration');
      setMessage('✅ Verified and updated! Redirecting...');
      setTimeout(() => router.push('/dashboard'), 2000);
    };

    verifyUser();
  }, [router]);

  return (
    <div style={{ padding: 40, textAlign: 'center' }}>
      <h2>{message}</h2>
    </div>
  );
}
