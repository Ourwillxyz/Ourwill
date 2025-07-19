import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../src/supabaseClient';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/login'); // Redirect to login if not authenticated
      } else {
        setUser(user);
      }
      setLoading(false);
    };
    checkAuth();
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

  if (!user) return null; // Prevent render flash before redirect

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f5f6fa',
      padding: '2rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start'
    }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Welcome to your Dashboard</h1>
      <div style={{
        background: '#fff',
        padding: '1.5rem 2rem',
        borderRadius: '10px',
        boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
        marginBottom: '2rem'
      }}>
        <p style={{ fontSize: '1.15rem', marginBottom: '0.4rem' }}>
          <strong>Email:</strong> {user.email}
        </p>
        {/* Add more personalized content here */}
      </div>
      <div>
        {/* Example dashboard content */}
        <h3>Dashboard Features</h3>
        <ul>
          <li>View your voter information</li>
          <li>Access polling details</li>
          <li>Update your profile</li>
          <li>More features coming soon...</li>
        </ul>
      </div>
    </div>
  );
}
