// pages/auth/callback.js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../src/supabaseClient";

export default function Callback() {
  const [message, setMessage] = useState("Verifying login...");
  const router = useRouter();

  useEffect(() => {
    const handleAuth = async () => {
      try {
        let sessionResponse;

        if (router.query.code) {
          // Case: Supabase returned ?code=... (PKCE flow)
          sessionResponse = await supabase.auth.exchangeCodeForSession(router.query.code);
        } else {
          // Case: Supabase returned #access_token=... (magic link flow)
          sessionResponse = await supabase.auth.getSession();
        }

        if (sessionResponse.error) {
          console.error("Auth error:", sessionResponse.error.message);
          setMessage("❌ Login failed: " + sessionResponse.error.message);
          return;
        }

        const session = sessionResponse.data?.session;
        if (!session) {
          setMessage("❌ No active session found.");
          return;
        }

        // Success 🎉
        setMessage("✅ Login successful! Redirecting...");
        router.replace("/dashboard"); // change to your target page
      } catch (err) {
        console.error("Unexpected error:", err);
        setMessage("❌ Something went wrong.");
      }
    };

    if (router.isReady) {
      handleAuth();
    }
  }, [router]);

  return (
    <div style={{ textAlign: "center", padding: 40 }}>
      <h2>{message}</h2>
    </div>
  );
}
