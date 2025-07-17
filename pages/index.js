// pages/index.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../src/supabaseClient';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        router.replace('/dashboard');
      } else {
        router.replace('/RegisterUser');
      }

      setLoading(false);
    };

    checkSession();
  }, [router]);

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <p>{loading ? 'Checking session, please wait...' : 'Redirecting...'}</p>
    </div>
  );
}
