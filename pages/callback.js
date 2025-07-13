import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../src/supabaseClient';

export default function Callback() {
  const router = useRouter();
  const [status, setStatus] = useState('Verifying login...');

  useEffect(() => {
    const verifyUser = async () => {
      try {
        // Get session from URL token
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error || !session) {
          setStatus('❌ Failed to verify login.');
          return;
        }

        const user = session.user;
        if (!user?.email) {
          setStatus('❌ Could not retrieve user email.');
          return;
        }

        // Get voter details from localStorage (email + location + mobile)
        const saved = localStorage.getItem('pendingVoter');
        if (!saved) {
          setStatus('⚠️ Missing registration details.');
          return;
        }

        const voterDetails = JSON.parse(saved);

        // Check if user already exists in 'voters' table
        const { data: existing, error: fetchError } = await supabase
          .from('voters')
          .select('*')
          .eq('email', user.email)
          .single();

        if (!existing) {
          // Insert new voter
          const { error: insertError } = await supabase.from('voters').insert([
            {
              email: voterDetails.email,
              mobile: voterDetails.mobile,
              county_code: voterDetails.county_code,
              subcounty_code: voterDetails.subcounty_code,
              ward_code: voterDetails.ward_code,
              polling_centre_id: voterDetails.polling_centre_id,
            },
          ]);

          if (insertError) {
            console.error('Insert error:', insertError);
            setStatus('❌ Failed to save voter record.');
            return;
          }
        }

        // Clean up localStorage
        localStorage.removeItem('pendingVoter');

        setStatus('✅ Login successful! Redirecting...');
        setTimeout(() => router.push('/dashboard'), 1500);
      } catch (err) {
        console.error('Callback error:', err);
        setStatus('❌ Unexpected error during login.');
      }
    };

    verifyUser();
  }, [router]);

  return (
    <div style={{ padding: 40 }}>
      <h2>🔐 Authenticating...</h2>
      <p>{status}</p>
    </div>
  );
}
