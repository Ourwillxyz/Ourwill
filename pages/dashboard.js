// pages/dashboard.js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../src/supabaseClient";

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/login");
        return;
      }

      const user = session.user;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (error) console.error("Profile fetch error:", error.message);
      if (mounted) {
        setProfile(data || null);
        setLoading(false);
      }
    };

    load();
    return () => { mounted = false; };
  }, [router]);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  if (loading) return <p style={{ padding: 24 }}>Loading…</p>;

  return (
    <div style={{ maxWidth: 720, margin: "2rem auto", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <h1>Dashboard</h1>
        <button
          onClick={signOut}
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            border: "1px solid #e5e7eb",
            background: "#fff",
            cursor: "pointer",
          }}
        >
          Sign out
        </button>
      </div>

      {profile ? (
        <div style={{ marginTop: 16 }}>
          <h3>Your Profile</h3>
          <pre style={{ background: "#f9fafb", padding: 16, borderRadius: 8 }}>
            {JSON.stringify(profile, null, 2)}
          </pre>
        </div>
      ) : (
        <p>No profile found (yet).</p>
      )}
    </div>
  );
}
