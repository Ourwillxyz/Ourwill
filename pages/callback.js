import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../src/supabaseClient';

export default function Callback() {
  const router = useRouter();
  const [status, setStatus] = useState('Verifying login...');

  // Simple SHA-256 hashing utility
  const hashData = async (text) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  useEffect(() => {
    const verifyUser = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error || !session?.user?.email) {
          setStatus('❌ Failed to verify session.');
          return;
        }

        const saved = localStorage.getItem('pendingVoter');
        if (!saved) {
          setStatus('⚠️ Missing local voter info.');
          return;
        }

        const voter = JSON.parse(saved);
        const combinedString = `${voter.email}|${voter.mobile}`;
        const voterHash = await hashData(combinedString);

        // Check if hashed voter already exists
        const { data: existing } = await supabase
          .from('voters')
          .select('id')
          .eq('voter_hash', voterHash)
          .maybeSingle();

        if (!existing) {
          const { error: insertError } = await supabase.from('voters').insert([
            {
              voter_hash: voterHash,
              county_code: voter.county_code,
              subcounty_code: voter.subcounty_code,
              ward_code: voter.ward_code,
              polling_centre_id: voter.polling_centre_id,
              registered_at: new Date().toISOString(),
            },
          ]);

          if (insertError) {
            console.error(insertError);
            setStatus('❌ Could not store voter.');
            return;
          }
        }

        localStorage.removeItem('pendingVoter');
        setStatus('✅ Verified. Redirecting...');
        setTimeout(() => router.push('/dashboard'), 1500);
      } catch (err) {
        console.error('Callback error:', err);
        setStatus('❌ Unexpected error.');
      }
    };

    verifyUser();
  }, [router]);

  return (
    <div style={{ padding: 40 }}>
      <h2>🔐 Processing Login</h2>
      <p>{status}</p>
    </div>
  );
}
