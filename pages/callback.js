import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../src/supabaseClient';
import sha256 from 'crypto-js/sha256';

export default function Callback() {
  const router = useRouter();

  useEffect(() => {
    const finishVerification = async () => {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        console.error('No user found:', authError);
        router.push('/RegisterUser');
        return;
      }

      const { email } = user;

      // Find pending record
      const { data: voter, error: fetchError } = await supabase
        .from('voter')
        .select('*')
        .eq('email', email)
        .eq('status', 'pending')
        .single();

      if (fetchError || !voter) {
        console.error('No pending voter entry found.');
        router.push('/RegisterUser');
        return;
      }

      const voter_hash = sha256(`${email}-${voter.username}`).toString();

      const { error: updateError } = await supabase
        .from('voter')
        .update({
          status: 'verified',
          voter_hash,
        })
        .eq('id', voter.id);

      if (updateError) {
        console.error('Failed to verify user:', updateError);
        router.push('/RegisterUser');
        return;
      }

      router.push('/dashboard');
    };

    finishVerification();
  }, []);

  return <p style={{ padding: 40 }}>⏳ Finalizing verification...</p>;
}
