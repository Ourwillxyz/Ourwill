// pages/callback.js

import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../src/supabaseClient';

export default function Callback() {
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (data.session) {
        // Redirect to dashboard or home
        router.replace('/');
      } else {
        router.replace('/Login');
      }
    };

    checkSession();
  }, [router]);

  return <p>Verifying login…</p>;
}
