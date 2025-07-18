import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../src/supabaseClient';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Example: Get user info from Supabase (adjust for your auth/session logic)
    const getUser = async () => {
      // If you use Supabase Auth:
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login'); // redirect if not logged in
      } else {
        setUser(user);
      }
      setLoading(false);
    };
    getUser();
  }, [router]);

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ minHeight: '100vh', padding: '2rem', background: '#f5f6fa' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
        Welcome to your Dashboard
      </h1>
      {user && (
        <div>
          <p><strong>Email:</strong> {user.email}</p>
          {/* Add more user-specific content and dashboard features here */}
        </div>
      )}
      {/* Add statistics, actions, etc. */}
    </div>
  );
}
