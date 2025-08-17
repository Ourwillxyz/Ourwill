import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function AuthCallback() {
  const router = useRouter();
  const [error, setError] = useState('');

  useEffect(() => {
    // Supabase redirects with tokens in URL hash, e.g. #access_token=...&refresh_token=...
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.replace(/^#/, ''));
    const access_token = params.get('access_token');
    const refresh_token = params.get('refresh_token');
    const error_description = params.get('error_description');

    if (access_token && refresh_token) {
      supabase.auth.setSession({ access_token, refresh_token })
        .then(({ error }) => {
          if (error) {
            setError(error.message);
          } else {
            // Redirect to set-password page after successful session
            router.replace('/auth/set-password');
          }
        });
    } else if (error_description) {
      setError(error_description);
    }
  }, [router]);

  if (error) return <div className="error">Error: {error}</div>;
  return <div>Authenticating, please wait...</div>;
}
