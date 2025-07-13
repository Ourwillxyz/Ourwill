import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../src/supabaseClient';
import sha256 from 'crypto-js/sha256';

export default function Dashboard() {
  const router = useRouter();
  const [location, setLocation] = useState(null);
  const [username, setUsername] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVoterData = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error || !session?.user) {
        router.push('/');
        return;
      }

      const email = session.user.email;
      const { data: mobileData, error: mobileErr } = await supabase
        .from('voters')
        .select('mobile')
        .eq('email', email)
        .single();

      if (mobileErr || !mobileData?.mobile) {
        console.error('Mobile not found for this email');
        router.push('/');
        return;
      }

      const hash = sha256(email + mobileData.mobile).toString();

      const { data: voter, error: voterError } = await supabase
        .from('voters')
        .select('county, subcounty, ward, polling_centre, username')
        .eq('voter_hash', hash)
        .single();

      if (voterError || !voter) {
        console.error('Voter not found');
        router.push('/');
        return;
      }

      setUsername(voter.username || 'User');
      setLocation({
        county: voter.county,
        subcounty: voter.subcounty,
        ward: voter.ward,
        pollingCentre: voter.polling_centre,
      });
      setLoading(false);
    };

    fetchVoterData();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return <div style={{ padding: 40 }}><h2>Loading dashboard...</h2></div>;
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Welcome to OurWill, @{username}</h1>

      <h3>Your Registered Polling Location:</h3>
      <ul>
        <li><strong>County:</strong> {location.county}</li>
        <li><strong>Subcounty:</strong> {location.subcounty}</li>
        <li><strong>Ward:</strong> {location.ward}</li>
        <li><strong>Polling Centre:</strong> {location.pollingCentre}</li>
      </ul>

      <button onClick={handleLogout} style={{ marginTop: 20, padding: '8px 16px' }}>
        Logout
      </button>
    </div>
  );
}
