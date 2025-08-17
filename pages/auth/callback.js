// pages/auth/callback.js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../src/supabaseClient";

export default function Callback() {
  const router = useRouter();
  const [msg, setMsg] = useState("Finishing login... please wait.");

  useEffect(() => {
    const run = async () => {
      try {
        // If the provider used PKCE (OAuth), this will succeed; otherwise it will just throw and we ignore it.
        try {
          await supabase.auth.exchangeCodeForSession();
        } catch (_) {
          // Not a PKCE flow; ignore.
        }

        // Check for auth errors in URL (Supabase may append them after /verify)
        const hash = window.location.hash || "";
        if (hash.includes("error_description")) {
          const params = new URLSearchParams(hash.replace(/^#/, ""));
          const err = params.get("error_description") || "Authentication error";
          console.error("Auth error:", err);
          router.replace("/login?error=" + encodeURIComponent(err));
          return;
        }

        // Get the session (works for magic link and OAuth)
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error("getSession error:", error.message);
          router.replace("/login?error=auth");
          return;
        }

        const session = data?.session;
        if (!session) {
          setMsg("Login link expired or invalid. Redirecting to login…");
          setTimeout(() => router.replace("/login"), 1500);
          return;
        }

        // ✅ Always send to set-password; that page sets/updates the password and then pushes to dashboard.
        router.replace("/set-password?first=1");
      } catch (e) {
        console.error("Callback exception:", e);
        router.replace("/login?error=server");
      }
    };

    run();
  }, [router]);

  // Simple visuals aligned with your app’s style
  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      position: 'relative',
      overflow: 'hidden'
    }}>
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
      <div style={{
        position: 'relative',
        zIndex: 1,
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <img
          src="/ourwill-logo.png"
          alt="Logo"
          style={{
            width: 170,
            maxWidth: '23vw',
            background: '#fff',
            borderRadius: 15,
            boxShadow: '0 0 16px rgba(0,0,0,0.08)',
            padding: '0.7rem',
            marginBottom: '1rem'
          }}
        />
        <div style={{
          background: '#fff',
          borderRadius: 10,
          boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
          padding: '1.5rem',
          maxWidth: 480,
          width: '90%',
          textAlign: 'center',
          fontSize: '1.1rem'
        }}>
          {msg}
          <div style={{ marginTop: 12, fontSize: '0.95rem', color: '#555' }}>
            Please wait while we complete your sign-in…
          </div>
        </div>
      </div>
    </div>
  );
}
