// pages/dashboard.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../src/supabaseClient';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [ongoingPolls, setOngoingPolls] = useState([]);
  const [upcomingPolls, setUpcomingPolls] = useState([]);
  const [closedPolls, setClosedPolls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        if (router.isReady) router.replace('/login');
        return;
      }

      setUser(user);

      // Insert voter if not exists
      await supabase
        .from('voters')
        .upsert([{ email: user.email, user_id: user.id }], { onConflict: 'email' });

      // Fetch polls with error handling
      const { data: ongoingData, error: ongoingError } = await supabase
        .from('polls')
        .select('*')
        .eq('status', 'ongoing');
      if (ongoingError) console.error('Error fetching ongoing polls:', ongoingError);
      setOngoingPolls(ongoingData || []);

      const { data: upcomingData, error: upcomingError } = await supabase
        .from('polls')
        .select('*')
        .eq('status', 'upcoming');
      if (upcomingError) console.error('Error fetching upcoming polls:', upcomingError);
      setUpcomingPolls(upcomingData || []);

      const { data: closedData, error: closedError } = await supabase
        .from('polls')
        .select('*')
        .eq('status', 'closed');
      if (closedError) console.error('Error fetching closed polls:', closedError);
      setClosedPolls(closedData || []);

      setLoading(false);
    };

    if (router.isReady) fetchAll();
  }, [router.isReady]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  if (loading) return <p>Loading dashboard...</p>;

  return (
    <div>
      <h1>Welcome, {user?.email}</h1>
      <button onClick={handleLogout}>Logout</button>

      <h2>Ongoing Polls</h2>
      {ongoingPolls.length > 0 ? (
        ongoingPolls.map((poll) => (
          <div key={poll.id}>
            <h3>{poll.title}</h3>
            <p>{poll.description}</p>
          </div>
        ))
      ) : (
        <p>No ongoing polls</p>
      )}

      <h2>Upcoming Polls</h2>
      {upcomingPolls.length > 0 ? (
        upcomingPolls.map((poll) => (
          <div key={poll.id}>
            <h3>{poll.title}</h3>
            <p>{poll.description}</p>
          </div>
        ))
      ) : (
        <p>No upcoming polls</p>
      )}

      <h2>Closed Polls</h2>
      {closedPolls.length > 0 ? (
        closedPolls.map((poll) => (
          <div key={poll.id}>
            <h3>{poll.title}</h3>
            <p>{poll.description}</p>
          </div>
        ))
      ) : (
        <p>No closed polls</p>
      )}
    </div>
  );
}
