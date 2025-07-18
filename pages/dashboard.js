import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../src/supabaseClient';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [lastVote, setLastVote] = useState(null);
  const [ongoingPoll, setOngoingPoll] = useState(null);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Only run client-side
    const userEmail = localStorage.getItem('user_email');
    if (!userEmail) {
      router.replace('/login');
      return;
    }

    async function fetchDashboardData() {
      try {
        // 1. Fetch user details
        const { data: voter, error: voterError } = await supabase
          .from('voter')
          .select('*')
          .eq('email', userEmail)
          .single();

        if (voterError || !voter) {
          setError('User profile not found.');
          setLoading(false);
          return;
        }

        // 2. Fetch last voting result
        const { data: lastVoteData, error: lastVoteError } = await supabase
          .from('votes')
          .select('*')
          .eq('email', userEmail)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        // 3. Fetch ongoing poll (where status = 'open')
        const { data: ongoingPollData, error: ongoingPollError } = await supabase
          .from('polls')
          .select('*')
          .eq('status', 'open')
          .order('end_date', { ascending: true })
          .limit(1)
          .single();

        // 4. Fetch upcoming notices (polls with status = 'upcoming')
        const { data: noticesData, error: noticesError } = await supabase
          .from('polls')
          .select('title, start_date')
          .eq('status', 'upcoming')
          .order('start_date', { ascending: true });

        setUser(voter);
        setLastVote(lastVoteData || null);
        setOngoingPoll(ongoingPollData || null);
        setNotices(noticesData || []);
        setLoading(false);
      } catch (err) {
        setError('Failed to load dashboard data.');
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('user_email');
    router.replace('/login');
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', marginTop: 100, fontSize: '1.2rem' }}>
        ⏳ Loading dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', marginTop: 100, color: 'red', fontSize: '1.1rem' }}>
        {error}
        <br />
        <button onClick={handleLogout} style={{
          backgroundColor: '#e53935',
          color: 'white',
          padding: '10px 20px',
          border: 'none',
          cursor: 'pointer',
          marginTop: '2rem'
        }}>
          Logout
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: '3rem auto', padding: 24, background: '#f7fafc', borderRadius: 10 }}>
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
            <p>You voted in: <strong>{lastVote.poll_title || lastVote.poll_id}</strong></p>
            <p><strong>Option Chosen:</strong> {lastVote.option_chosen || lastVote.option_id}</p>
            <p><strong>Date:</strong> {lastVote.created_at ? new Date(lastVote.created_at).toLocaleDateString() : 'N/A'}</p>
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
            <p><strong>Status:</strong> Open until {ongoingPoll.end_date ? new Date(ongoingPoll.end_date).toLocaleDateString() : 'N/A'}</p>
            <button style={{ marginTop: 10, padding: '8px 16px', backgroundColor: '#006400', color: '#fff', border: 'none', borderRadius: '4px' }}>
              Vote Now
            </button>
          </>
        ) : (
          <p>No ongoing polls at the moment.</p>
        )}
      </section>

      <section style={{ marginTop: 30 }}>
        <h2>📅 Upcoming Notices</h2>
        <ul>
          {Array.isArray(notices) && notices.length > 0 ? notices.map((n, i) => (
            <li key={i}>{n.title} - Opens {n.start_date ? new Date(n.start_date).toLocaleDateString() : 'N/A'}</li>
          )) : <li>No upcoming notices.</li>}
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
