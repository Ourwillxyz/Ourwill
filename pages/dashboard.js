import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../src/supabaseClient';

export default function Dashboard() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (!session || error) {
        router.push('/'); // Redirect to home if not logged in
      } else {
        setUserEmail(session.user.email);
        setLoading(false);
      }
    };

    checkSession();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div style={{ padding: 40 }}>
        <h2>🔄 Loading dashboard...</h2>
      </div>
    );
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>🎉 Welcome to OurWill Dashboard</h1>
      <p>You are logged in as: <strong>{userEmail}</strong></p>

      <button onClick={handleLogout} style={{ marginTop: 20, padding: '8px 16px' }}>
        Logout
      </button>
    </div>
  );
}
