import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../src/supabaseClient';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [voter, setVoter] = useState(null);
  const [ongoingPolls, setOngoingPolls] = useState([]);
  const [upcomingPolls, setUpcomingPolls] = useState([]);
  const [closedPolls, setClosedPolls] = useState([]);
  const [loading, setLoading] = useState(true);

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

      // Fetch ongoing polls
      const { data: ongoingData } = await supabase
        .from('polls')
        .select('*')
        .eq('status', 'ongoing');
      setOngoingPolls(ongoingData || []);

      // Fetch upcoming polls
      const { data: upcomingData } = await supabase
        .from('polls')
        .select('*')
        .eq('status', 'upcoming');
      setUpcomingPolls(upcomingData || []);

      // Fetch closed polls
      const { data: closedData } = await supabase
        .from('polls')
        .select('*')
        .eq('status', 'closed');
      setClosedPolls(closedData || []);

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

  // Helper components
  const voterInfo = (
    <div style={{
      background: '#fff',
      padding: '1.2rem 1.1rem',
      borderRadius: '10px',
      boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
      marginBottom: '1.4rem',
      width: '100%',
      minHeight: 210,
    }}>
      <h3 style={{ marginBottom: 12 }}>Voter Information</h3>
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
          padding: '0.6rem 1.1rem',
          background: '#4f46e5',
          color: '#fff',
          borderRadius: '7px',
          border: 'none',
          fontWeight: '500',
          fontSize: '1rem',
          cursor: 'pointer'
        }}
        onClick={() => router.push('/update-profile')}
      >
        Update Profile
      </button>
    </div>
  );

  const pollingCTA = (
    <div style={{
      background: '#fff',
      padding: '1.2rem 1.1rem',
      borderRadius: '10px',
      boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
      marginBottom: '1.4rem',
      width: '100%',
      minHeight: 210,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between'
    }}>
      <h3 style={{ marginBottom: 12 }}>Ready to Vote?</h3>
      <p>
        <strong>Your voice matters!</strong><br />
        Participate in ongoing polls and make a difference.<br />
        <span style={{ color: '#4f46e5', fontWeight: 500 }}>
          Vote based on your values and vision, not monetary gain.
        </span>
      </p>
      <button
        style={{
          marginTop: 20,
          padding: '0.7rem 1.2rem',
          background: '#16a34a',
          color: '#fff',
          borderRadius: '7px',
          border: 'none',
          fontWeight: '500',
          fontSize: '1rem',
          cursor: 'pointer',
          alignSelf: 'flex-start'
        }}
        onClick={() => router.push('/polls')}
      >
        Go to Polls
      </button>
    </div>
  );

  const closedPollsSection = (
    <div style={{
      background: '#fff',
      padding: '1.2rem 1.1rem',
      borderRadius: '10px',
      boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
      minHeight: 210,
      width: '100%',
    }}>
      <h3 style={{ marginBottom: 12 }}>Closed Polls</h3>
      {closedPolls.length === 0 ? (
        <p>No closed polls yet.</p>
      ) : (
        <ul>
          {closedPolls.map(poll => (
            <li key={poll.id} style={{ marginBottom: 12 }}>
              <strong>{poll.title}</strong>
              <br />
              {poll.description}
              <br />
              <span style={{ fontSize: '0.95em', color: '#555' }}>
                Ended: {poll.end_date ? new Date(poll.end_date).toLocaleString() : 'TBD'}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  const upcomingPollsSection = (
    <div style={{
      background: '#fff',
      padding: '1.2rem 1.1rem',
      borderRadius: '10px',
      boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
      minHeight: 210,
      width: '100%',
    }}>
      <h3 style={{ marginBottom: 12 }}>Upcoming Polls</h3>
      {upcomingPolls.length === 0 ? (
        <p>No upcoming polls scheduled.</p>
      ) : (
        <ul>
          {upcomingPolls.map(poll => (
            <li key={poll.id} style={{ marginBottom: 12 }}>
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
  );

  // Kenyan flag background, opaque overlay
  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Opaque Kenyan flag background */}
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        backgroundImage: 'url("/kenya-flag.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        opacity: 0.17,
        pointerEvents: 'none'
      }} />
      {/* Main content */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        {/* Top logo & flag */}
        <div style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          marginBottom: '2rem',
          position: 'relative'
        }}>
          <img src="/ourwill-logo.png" alt="Logo" style={{
            width: 120,
            background: '#fff',
            borderRadius: '15px',
            boxShadow: '0 0 16px rgba(0,0,0,0.08)',
            zIndex: 1,
            padding: '0.6rem',
            marginBottom: '0.7rem'
          }} />
        </div>
        {/* 2x2 grid dashboard */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gridTemplateRows: '1fr 1fr',
          gap: '2.1rem',
          width: '100%',
          maxWidth: 1040,
          margin: '0 auto',
          marginBottom: '2.5rem'
        }}>
          {/* Row 1 */}
          <div>{voterInfo}</div>
          <div>{pollingCTA}</div>
          {/* Row 2 */}
          <div>{closedPollsSection}</div>
          <div>{upcomingPollsSection}</div>
        </div>
        {/* Bottom ongoing poll section */}
        <div style={{
          width: '100%',
          maxWidth: 700,
          background: '#fff',
          padding: '1.3rem 1rem',
          borderRadius: '10px',
          boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
          marginBottom: '2rem',
          textAlign: 'center'
        }}>
          <h3>Ongoing Poll</h3>
          {ongoingPolls.length === 0 ? (
            <p>No ongoing polls at the moment.</p>
          ) : (
            ongoingPolls.map(poll => (
              <div key={poll.id} style={{ marginBottom: 12 }}>
                <strong>{poll.title}</strong>
                <br />
                {poll.description}
                <br />
                <span style={{ fontSize: '0.95em', color: '#555' }}>
                  Ends: {poll.end_date ? new Date(poll.end_date).toLocaleString() : 'TBD'}
                </span>
                <br />
                <button
                  style={{
                    marginTop: 10,
                    padding: '0.6rem 1.1rem',
                    background: '#4f46e5',
                    color: '#fff',
                    borderRadius: '7px',
                    border: 'none',
                    fontWeight: '500',
                    fontSize: '1rem',
                    cursor: 'pointer'
                  }}
                  onClick={() => router.push(`/polls/${poll.id}`)}
                >
                  Vote Now
                </button>
              </div>
            ))
          )}
        </div>
        {/* Logout */}
        <div style={{ marginBottom: '1rem' }}>
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
    </div>
  );
}
