import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

const dummyUser = {
  email: 'user@example.com',
  county: 'Mombasa',
  subcounty: 'Mvita',
  ward: 'Tudor Ward',
};

const dummyVotes = [
  {
    id: '1',
    title: 'Governor Mombasa Recall Vote',
    description: 'Vote to decide if the current Governor should be recalled.',
    status: 'closed',
    target: 'Tudor Ward',
  },
  {
    id: '2',
    title: 'Youth Climate Action Bill Referendum',
    description: 'Referendum on the Climate Action Bill by Gen Z activists.',
    status: 'ongoing',
    target: 'All Wards',
  },
  {
    id: '3',
    title: 'Constitutional Amendment Poll',
    description: 'Vote on proposed constitutional amendments regarding IEBC.',
    status: 'upcoming',
    target: 'Westlands Ward',
  },
];

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Replace this with real auth/session check
    const session = localStorage.getItem('ourwill_voter');
    if (!session) {
      router.push('/'); // redirect to homepage or login
    } else {
      setUser(JSON.parse(session));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('ourwill_voter');
    router.push('/');
  };

  if (!user) return <div>Loading dashboard...</div>;

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h2>Welcome to OurWill Dashboard</h2>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Location:</strong> {user.ward}, {user.subcounty}, {user.county}</p>

      <h3>Your Voting Activity</h3>
      <ul>
        {dummyVotes.map((vote) => (
          <li key={vote.id} style={{ marginBottom: '10px' }}>
            <strong>{vote.title}</strong> <br />
            <em>{vote.description}</em><br />
            <strong>Status:</strong> {vote.status.toUpperCase()} | <strong>Target:</strong> {vote.target}
          </li>
        ))}
      </ul>

      <button onClick={handleLogout} style={{
        marginTop: '20px',
        padding: '10px 20px',
        background: 'darkred',
        color: 'white',
        border: 'none',
        cursor: 'pointer'
      }}>
        Logout
      </button>
    </div>
  );
}
