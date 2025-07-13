// pages/logout.js

import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';

// Create Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Logout() {
  const router = useRouter();

  useEffect(() => {
    const logout = async () => {
      await supabase.auth.signOut(); // Ends the session
      router.push('/'); // Redirect to home page or login
    };

    logout();
  }, [router]);

  return (
    <div style={{ padding: 20 }}>
      <p>Logging you out...</p>
    </div>
  );
}
