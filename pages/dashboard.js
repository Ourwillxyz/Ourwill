import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const voterData = JSON.parse(localStorage.getItem('voter_session'));
    if (!voterData) {
      router.push('/login'); // If not logged in, go to login page
    } else {
      setUser(voterData);
      setLoading(false);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('voter_session');
    router.push('/login');
  };

  if (loading) return <p style={{ textAlign: 'center', marginTop: 100 }}>⏳ Loading dashboard...</p>;

  return (
    <div style={{ maxWidth: 800, margin: '3rem auto', padding: 24 }}>
      <h1>🎉 Welcome, {user?.username || 'Voter'}!</h1>

      <section style={{ marginTop: 30 }}>
        <h2>📌 Your Details</h2>
        <ul>
          <li><strong>Email:</strong> {user.email || 'N/A'}</li>
          <li><strong>County:</strong> {user.county}</li>
          <li><strong>Subcounty:</strong> {user.subcounty}</li>
          <li><strong>Ward:</strong> {user.ward}</li>
          <li><strong>Polling Centre:</strong> {user.polling_centre}</li>
        </ul>
      </section>

      <section style={{ marginTop: 30 }}>
        <h2>📊 Last Voting Summary</h2>
        <p>You voted in the 2025 County Youth Budget Poll.</p>
        <p><strong>Option Chosen:</strong> Increased bursaries</p>
        <p><strong>Date:</strong> July 5, 2025</p>
      </section>

      <section style={{ marginTop: 30 }}>
        <h2>🗳️ Ongoing Voting</h2>
        <p><strong>Poll:</strong> Youth Empowerment Program Preferences</p>
        <p><strong>Status:</strong> Open until July 20, 2025</p>
        <button style={{ marginTop: 10, padding: '8px 16px' }}>Vote Now</button>
      </section>

      <section style={{ marginTop: 30 }}>
        <h2>📅 Upcoming Notices</h2>
        <ul>
          <li>📌 County Development Fund Vote - Opens August 10, 2025</li>
          <li>📌 Public Transport Safety Review Vote - Opens September 1, 2025</li>
        </ul>
      </section>

      <div style={{ marginTop: 50 }}>
        <button onClick={handleLogout} style={{
          backgroundColor: '#e53935',
          color: 'white',
          padding: '10px 20px',
          border: 'none',
          cursor: 'pointer'
        }}>
          🚪 Logout
        </button>
      </div>
    </div>
  );
}
