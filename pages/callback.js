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

      // Update voter status from 'pending' to 'verified'
      const { error: updateError } = await supabase
        .from('voter')
        .update({ status: 'verified' })
        .eq('email', userEmail);

      if (updateError) {
        console.error(updateError);
        setMessage('❌ Failed to update voter status.');
        return;
      }

      // Clear localStorage just in case
      localStorage.removeItem('pending_registration');

      setMessage('✅ Your email is verified. Redirecting...');
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
