// pages/dashboard.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../src/supabaseClient';
import sha256 from 'crypto-js/sha256';

export default function Dashboard() {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [voter, setVoter] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessionAndVoter = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session || !session.user) {
        router.push('/'); // redirect to homepage if not logged in
        return;
      }

      setSession(session);

      const email = session.user.email;

      // Fetch mobile number from the voter table using email
      const { data: voterMatch, error } = await supabase
        .from('voter')
        .select('mobile, voter_hash, username, county, subcounty, ward, polling_centre')
        .eq('email', email)
        .single();

      if (error || !voterMatch) {
        console.warn('Voter not found or error:', error);
        setLoading(false);
        return;
      }

      // Hash to compare for voter verification
      const computedHash = sha256(email + voterMatch.mobile).toString();

      if (computedHash !== voterMatch.voter_hash) {
        console.warn('Hash mismatch: Unauthorized');
        setLoading(false);
        return;
      }

      setVoter(voterMatch);
      setLoading(false);
    };

    fetchSessionAndVoter();
  }, [router]);

  if (loading) {
    return <div style={{ padding: 40 }}>Loading your voter dashboard...</div>;
  }

  if (!voter) {
    return (
      <div style={{ padding: 40, color: 'red' }}>
        ⚠️ No matching voter record found for your email. Please register again or contact support.
      </div>
    );
  }

  return (
    <div style={{ padding: 40 }}>
      <h2>Welcome, {voter.username || 'Voter'} 🎉</h2>
      <p>Your polling information:</p>
      <ul>
        <li><strong>County:</strong> {voter.county}</li>
        <li><strong>Subcounty:</strong> {voter.subcounty}</li>
        <li><strong>Ward:</strong> {voter.ward}</li>
        <li><strong>Polling Centre:</strong> {voter.polling_centre}</li>
      </ul>

      <p style={{ marginTop: 30, fontStyle: 'italic' }}>
        📌 This dashboard will later include your active polls and results.
      </p>

      <button
        onClick={async () => {
          await supabase.auth.signOut();
          router.push('/');
        }}
        style={{ marginTop: 20, padding: '8px 16px' }}
      >
        Logout
      </button>
    </div>
  );
}
