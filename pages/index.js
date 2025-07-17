// pages/index.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../utils/supabaseClient';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          router.replace('/dashboard');
        } else {
          router.replace('/RegisterUser');
        }
      } catch (error) {
        console.error('Session check failed:', error);
        router.replace('/RegisterUser');
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, [router]);

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      {loading ? <p>Checking user session...</p> : <p>Redirecting...</p>}
    </div>
  );
}
