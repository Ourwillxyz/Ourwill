// pages/dashboard.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../src/supabaseClient';

export default function Dashboard() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const voterHash = localStorage.getItem('voter_hash');

      if (!voterHash) {
        router.push('/');
        return;
      }

      const { data, error } = await supabase
        .from('voter')
        .select('*')
        .eq('voter_hash', voterHash)
        .maybeSingle();

      if (error || !data) {
        router.push('/');
        return;
      }

      setUserData(data);
      setLoading(false);
    };

    fetchUser();
  }, []);

  if (loading) return <p style={{ textAlign: 'center', marginTop: '20%' }}>Loading Dashboard...</p>;

  const formattedNextElection = 'Sunday, 10 August 2025 at 08:00 AM';

  return (
    <div style={{ padding: '2rem', maxWidth: 800, margin: 'auto' }}>
      <h2>Welcome to Your Voter Dashboard</h2>
      <p style={{ fontSize: 16 }}>Your registration has been verified successfully.</p>

      <div style={{ marginTop: 30, padding: 20, border: '1px solid #ccc', borderRadius: 8 }}>
        <h3>Your Voter Information</h3>
        <ul>
          <li><strong>Email:</strong> {userData.email_hash ? 'Hidden (Hashed)' : 'N/A'}</li>
          <li><strong>County:</strong> {userData.county}</li>
          <li><strong>Subcounty:</strong> {userData.subcounty}</li>
          <li><strong>Ward:</strong> {userData.ward}</li>
          <li><strong>Polling Centre:</strong> {userData.polling_centre}</li>
        </ul>
      </div>

      <div style={{ marginTop: 30 }}>
        <h3>🗳️ Last Voting Results</h3>
        <p>Last vote you participated in: <em>Data coming soon</em></p>
      </div>

      <div style={{ marginTop: 30 }}>
        <h3>✅ Ongoing Voting</h3>
        <p>No active votes at the moment.</p>
      </div>

      <div style={{ marginTop: 30 }}>
        <h3>📅 Upcoming Voting Notices</h3>
        <p>Next scheduled vote: <strong>{formattedNextElection}</strong></p>
      </div>
    </div>
  );
}
