// pages/logout.js

import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../utils/supabaseClient';

export default function Logout() {
  const router = useRouter();

  useEffect(() => {
    const doLogout = async () => {
      await supabase.auth.signOut();
      router.replace('/');
    };
    doLogout();
  }, [router]);

  return <p>Logging out...</p>;
}
