import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../src/supabaseClient';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [voter, setVoter] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function checkAuthAndFetch() {
      // Get session user from Supabase Auth
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        router.replace('/login');
        return;
      }
      setUser(authUser);

      // Fetch voter details from your table (customize as needed)
      const { data: voterData } = await supabase
        .from('voter')
        .select('*')
        .eq('email', authUser.email)
        .single();

      setVoter(voterData);
      setLoading(false);
    }
    checkAuthAndFetch();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  if (loading) return (
    <div style={{ textAlign: 'center', marginTop: 100, fontSize: '1.2rem' }}>
      ⏳ Loading dashboard...
    </div>
  );

  if (!user) return null;

  return (
    <div style={{
      maxWidth: 800, margin: '3rem auto', padding: 24,
      background: '#f7fafc', borderRadius: 10
    }}>
      <h1>🎉 Welcome, {voter?.username || user.email || 'Voter'}!</h1>
      <section style={{ marginTop: 30 }}>
        <h2>📌 Your Details</h2>
        <ul>
          <li><strong>Email:</strong> {user.email}</li>
          <li><strong>County:</strong> {voter?.county || 'N/A'}</li>
          <li><strong>Subcounty:</strong> {voter?.subcounty || 'N/A'}</li>
          <li><strong>Ward:</strong> {voter?.ward || 'N/A'}</li>
          <li><strong>Polling Centre:</strong> {voter?.polling_centre || 'N/A'}</li>
        </ul>
      </section>
      <div style={{ marginTop: 50 }}>
        <button onClick={handleLogout} style={{
          backgroundColor: '#e53935',
          color: 'white',
          padding: '10px 20px',
          border: 'none',
          cursor: 'pointer',
          borderRadius: '4px'
        }}>
          🚪 Logout
        </button>
      </div>
    </div>
  );
}
