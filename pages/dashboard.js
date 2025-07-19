import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../src/supabaseClient';

// Simple inline bar chart component
function BarChart({ data }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div style={{ padding: '1rem 0' }}>
      <h4 style={{ marginBottom: 8 }}>Recent Voter Reasons (Ideology vs. Monetary Gain)</h4>
      {data.map((d) => (
        <div key={d.label} style={{ marginBottom: 6 }}>
          <span style={{ display: 'inline-block', width: 100 }}>{d.label}</span>
          <div style={{ display: 'inline-block', verticalAlign: 'middle', height: 18, background: '#4f46e5', borderRadius: 4, width: `${(d.value / max) * 200}px` }} />
          <span style={{ marginLeft: 12 }}>{d.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [voter, setVoter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [polls, setPolls] = useState([]);
  const [upcomingPolls, setUpcomingPolls] = useState([]);
  const [chartData, setChartData] = useState([
    { label: 'Ideology', value: 0 },
    { label: 'Monetary Gain', value: 0 }
  ]);

  useEffect(() => {
    const fetchAll = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/login');
        return;
      }
      setUser(user);

      // Fetch voter details
      const { data: voterData } = await supabase
        .from('voter')
        .select('*')
        .eq('email', user.email)
        .single();
      setVoter(voterData);

      // Fetch bar chart data (example: ideology vs monetary gain)
      // Replace with your actual table/columns
      const { data: reasonsData } = await supabase
        .from('voting_reason')
        .select('reason, count')
        .in('reason', ['Ideology', 'Monetary Gain']);
      if (reasonsData) {
        setChartData([
          { label: 'Ideology', value: reasonsData.find(d => d.reason === 'Ideology')?.count || 0 },
          { label: 'Monetary Gain', value: reasonsData.find(d => d.reason === 'Monetary Gain')?.count || 0 }
        ]);
      }

      // Fetch ongoing polls
      const { data: pollData } = await supabase
        .from('polls')
        .select('*')
        .eq('status', 'ongoing');
      setPolls(pollData || []);

      // Fetch upcoming polls
      const { data: upcomingData } = await supabase
        .from('polls')
        .select('*')
        .eq('status', 'upcoming');
      setUpcomingPolls(upcomingData || []);

      setLoading(false);
    };
    fetchAll();
  }, [router]);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.4rem'
      }}>
        Loading dashboard...
      </div>
    );
  }

  if (!user) return null;

  // Extract username from email
  const username = user.email.split('@')[0];

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f5f6fa',
      padding: '2rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      <img src="/ourwill-logo.png" alt="Logo" style={{ width: 120, marginBottom: 24 }} />

      <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#4733a8' }}>
        Welcome, {username}!
      </h1>

      <div style={{
        background: '#fff',
        padding: '1.5rem 2rem',
        borderRadius: '10px',
        boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
        marginBottom: '2rem',
        width: '100%',
        maxWidth: 480
      }}>
        <h3 style={{ marginBottom: 12 }}>Your Voter Information</h3>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Mobile:</strong> {voter?.mobile || <em>Not set</em>}</p>
        <p><strong>Username:</strong> {voter?.username || username}</p>
        <p><strong>County:</strong> {voter?.county || <em>Not set</em>}</p>
        <p><strong>Subcounty:</strong> {voter?.subcounty || <em>Not set</em>}</p>
        <p><strong>Ward:</strong> {voter?.ward || <em>Not set</em>}</p>
        <p><strong>Polling Centre:</strong> {voter?.polling_centre || <em>Not set</em>}</p>
        <button
          style={{
            marginTop: 20,
            padding: '0.8rem 1.3rem',
            background: '#4f46e5',
            color: '#fff',
            borderRadius: '7px',
            border: 'none',
            fontWeight: '500',
            fontSize: '1.05rem',
            cursor: 'pointer'
          }}
          onClick={() => router.push('/update-profile')}
        >
          Update Profile
        </button>
      </div>

      <div style={{
        background: '#fff',
        padding: '1.5rem 2rem',
        borderRadius: '10px',
        boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
        marginBottom: '2rem',
        width: '100%',
        maxWidth: 480
      }}>
        <h3>Sincere Voting Matters</h3>
        <p>
          <strong>Make your choice based on ideology and vision, not monetary gain.</strong><br />
          Your vote can shape the future. Avoid short-term temptations and choose leaders who share your values and goals for your community.
        </p>
        <BarChart data={chartData} />
      </div>

      <div style={{
        background: '#fff',
        padding: '1.5rem 2rem',
        borderRadius: '10px',
        boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
        marginBottom: '2rem',
        width: '100%',
        maxWidth: 480
      }}>
        <h3>Ongoing Polls</h3>
        {polls.length === 0 ? (
          <p>No ongoing polls at this moment.</p>
        ) : (
          <ul>
            {polls.map((poll) => (
              <li key={poll.id}>
                <strong>{poll.title}</strong>
                <br />
                {poll.description}
                <br />
                <span style={{ fontSize: '0.95em', color: '#555' }}>
                  Ends: {poll.end_date ? new Date(poll.end_date).toLocaleString() : 'TBD'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div style={{
        background: '#fff',
        padding: '1.5rem 2rem',
        borderRadius: '10px',
        boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
        width: '100%',
        maxWidth: 480
      }}>
        <h3>Upcoming Polls</h3>
        {upcomingPolls.length === 0 ? (
          <p>No upcoming polls scheduled.</p>
        ) : (
          <ul>
            {upcomingPolls.map((poll) => (
              <li key={poll.id}>
                <strong>{poll.title}</strong>
                <br />
                {poll.description}
                <br />
                <span style={{ fontSize: '0.95em', color: '#555' }}>
                  Starts: {poll.start_date ? new Date(poll.start_date).toLocaleString() : 'TBD'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div style={{ marginTop: 16 }}>
        <button
          style={{
            background: '#ef4444',
            color: '#fff',
            padding: '0.7rem 1.2rem',
            border: 'none',
            borderRadius: '6px',
            fontSize: '1rem',
            fontWeight: '500',
            cursor: 'pointer'
          }}
          onClick={async () => {
            await supabase.auth.signOut();
            router.push('/login');
          }}
        >
          Log Out
        </button>
      </div>
    </div>
  );
}
