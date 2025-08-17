// File: pages/auth/callback.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../src/supabaseClient';

export default function Callback() {
  const router = useRouter();
  const [msg, setMsg] = useState('Finishing login... please wait.');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get current user from Supabase auth
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;

        if (!user) {
          setMsg('User not found. Redirecting to signup...');
          setTimeout(() => router.push('/trial-email-signup'), 2000);
          return;
        }

        // Check if user exists in profiles table
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          // Any error other than "no rows found"
          throw profileError;
        }

        if (!profileData) {
          // Profile not yet created, redirect to set-password.js
          router.push('/set-password');
        } else {
          // Profile exists, redirect to dashboard
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('Callback error:', error);
        setMsg('Unexpected error, please try again.');
        setLoading(false);
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #ece9f7 0%, #fff 100%)',
      textAlign: 'center',
      padding: '2rem'
    }}>
      <div style={{
        background: '#fff',
        padding: '2rem 3rem',
        borderRadius: 16,
        boxShadow: '0 4px 24px rgba(0,0,0,0.17)',
        maxWidth: 400
      }}>
        <h2 style={{ color: '#4733a8', marginBottom: 16 }}>{msg}</h2>
        {loading && <p style={{ color: '#4f46e5' }}>Please wait...</p>}
      </div>
    </div>
  );
}
