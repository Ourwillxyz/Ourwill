import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../src/supabaseClient';

// Placeholder components for each admin section
function PollsAdmin() {
  return (
    <div>
      <h2>Manage Polls</h2>
      {/* TODO: Implement create, view, edit, close polls */}
      <p>Poll management functions will go here.</p>
    </div>
  );
}

function CandidatesAdmin() {
  return (
    <div>
      <h2>Manage Candidates</h2>
      {/* TODO: Implement add, approve, edit candidates */}
      <p>Candidate management functions will go here.</p>
    </div>
  );
}

function AnnouncementsAdmin() {
  return (
    <div>
      <h2>Send Announcements</h2>
      {/* TODO: Implement create, view announcements/messages */}
      <p>Announcement/message functions will go here.</p>
    </div>
  );
}

export default function AdminPage() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState('');
  const [tab, setTab] = useState('polls');
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/login');
        return;
      }
      setUser(user);

      // Hard-coded super admin email
      const superAdminEmail = 'admin@ourwill.xyz';
      if (user.email === superAdminEmail) {
        setRole('admin');
        return;
      }

      // Fallback to user_metadata for other admins
      const userRole = user.user_metadata?.role || '';
      setRole(userRole);
      if (userRole !== 'admin') {
        router.replace('/dashboard');
      }
    };
    getUser();
  }, [router]);

  if (!user || role !== 'admin') {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <span>Loading admin dashboard...</span>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #ece9f7 0%, #fff 100%)',
      padding: '2rem'
    }}>
      <div style={{
        maxWidth: 900,
        margin: '0 auto',
        background: '#fff',
        borderRadius: 14,
        boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
        padding: '2rem'
      }}>
        <h1 style={{ color: '#4733a8', marginBottom: 24 }}>Admin Dashboard</h1>
        <nav style={{ marginBottom: 32, display: 'flex', gap: 20 }}>
          <button
            onClick={() => setTab('polls')}
            style={{
              padding: '10px 28px',
              borderRadius: 8,
              border: 'none',
              background: tab === 'polls' ? '#4f46e5' : '#ece9f7',
              color: tab === 'polls' ? '#fff' : '#4733a8',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Manage Polls
          </button>
          <button
            onClick={() => setTab('candidates')}
            style={{
              padding: '10px 28px',
              borderRadius: 8,
              border: 'none',
              background: tab === 'candidates' ? '#4f46e5' : '#ece9f7',
              color: tab === 'candidates' ? '#fff' : '#4733a8',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Manage Candidates
          </button>
          <button
            onClick={() => setTab('announcements')}
            style={{
              padding: '10px 28px',
              borderRadius: 8,
              border: 'none',
              background: tab === 'announcements' ? '#4f46e5' : '#ece9f7',
              color: tab === 'announcements' ? '#fff' : '#4733a8',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Announcements
          </button>
        </nav>
        <section>
          {tab === 'polls' && <PollsAdmin />}
          {tab === 'candidates' && <CandidatesAdmin />}
          {tab === 'announcements' && <AnnouncementsAdmin />}
        </section>
      </div>
    </div>
  );
}
