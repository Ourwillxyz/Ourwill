import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../src/supabaseClient';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [lastVote, setLastVote] = useState(null);
  const [ongoingPoll, setOngoingPoll] = useState(null);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Get user email from localStorage/session (or use Supabase auth if set up)
    const userEmail = JSON.parse(localStorage.getItem('voter_session'))?.email;
    if (!userEmail) {
      router.push('/login');
      return;
    }

    async function fetchDashboardData() {
      // 1. Fetch user details
      const { data: voter, error: voterError } = await supabase
        .from('voter')
        .select('*')
        .eq('email', userEmail)
        .single();

      // 2. Fetch last voting result
      const { data: lastVoteData } = await supabase
        .from('votes')
        .select('*')
        .eq('email', userEmail)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      // 3. Fetch ongoing poll (example: where status = 'open')
      const { data: ongoingPollData } = await supabase
        .from('polls')
        .select('*')
        .eq('status', 'open')
        .order('end_date', { ascending: true })
        .limit(1)
        .single();

      // 4. Fetch upcoming notices (example: polls with status = 'upcoming')
      const { data: noticesData } = await supabase
        .from('polls')
        .select('title, start_date')
        .eq('status', 'upcoming')
        .order('start_date', { ascending: true });

      setUser(voter);
      setLastVote(lastVoteData);
      setOngoingPoll(ongoingPollData);
      setNotices(noticesData || []);
      setLoading(false);
    }

    fetchDashboardData();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('voter_session');
    router.push('/login');
  };

  if (loading) return <p style={{ textAlign: 'center', marginTop: 100 }}>⏳ Loading dashboard...</p>;

  return (
    <div style={{ maxWidth: 800, margin: '3rem auto', padding: 24 }}>
      <h1>🎉 Welcome, {user?.username || user?.email || 'Voter'}!</h1>
      <section style={{ marginTop: 30 }}>
        <h2>📌 Your Details</h2>
        <ul>
          <li><strong>Email:</strong> {user.email || 'N/A'}</li>
          <li><strong>County:</strong> {user.county || 'N/A'}</li>
          <li><strong>Subcounty:</strong> {user.subcounty || 'N/A'}</li>
          <li><strong>Ward:</strong> {user.ward || 'N/A'}</li>
          <li><strong>Polling Centre:</strong> {user.polling_centre || 'N/A'}</li>
        </ul>
      </section>

      <section style={{ marginTop: 30 }}>
        <h2>📊 Last Voting Summary</h2>
        {lastVote ? (
          <>
            <p>You voted in: {lastVote.poll_title}</p>
            <p><strong>Option Chosen:</strong> {lastVote.option_chosen}</p>
            <p><strong>Date:</strong> {new Date(lastVote.created_at).toLocaleDateString()}</p>
          </>
        ) : (
          <p>No voting history found.</p>
        )}
      </section>

      <section style={{ marginTop: 30 }}>
        <h2>🗳️ Ongoing Voting</h2>
        {ongoingPoll ? (
          <>
            <p><strong>Poll:</strong> {ongoingPoll.title}</p>
            <p><strong>Status:</strong> Open until {new Date(ongoingPoll.end_date).toLocaleDateString()}</p>
            <button style={{ marginTop: 10, padding: '8px 16px' }}>Vote Now</button>
          </>
        ) : (
          <p>No ongoing polls at the moment.</p>
        )}
      </section>

      <section style={{ marginTop: 30 }}>
        <h2>📅 Upcoming Notices</h2>
        <ul>
          {notices.length ? notices.map((n, i) => (
            <li key={i}>{n.title} - Opens {new Date(n.start_date).toLocaleDateString()}</li>
          )) : <li>No upcoming notices.</li>}
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
