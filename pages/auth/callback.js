import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../src/supabaseClient";

export default function AuthCallback() {
  const router = useRouter();
  const [msg, setMsg] = useState("Finishing login... please wait.");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session) {
          setMsg("No active session found. Redirecting...");
          setTimeout(() => router.push("/trial-email-signup"), 2000);
          return;
        }

        const user = session.user;
        if (!user) {
          setMsg("User not found. Redirecting...");
          setTimeout(() => router.push("/trial-email-signup"), 2000);
          return;
        }

        // Try to find user in your table
        let { data: voter } = await supabase.from("voter").select("*").eq("email", user.email).single();

        if (!voter) {
          // Attempt to insert minimal record for multiple attempts
          await supabase.from("voter").insert([{ email: user.email, id: user.id, created_at: new Date().toISOString() }]);
          // Retry fetching
          const { data: retryVoter } = await supabase.from("voter").select("*").eq("email", user.email).single();
          voter = retryVoter;
        }

        if (voter) {
          // Redirect to set-password page if no password yet
          router.push("/set-password");
        } else {
          // Final fallback
          setMsg("Unable to populate user. Redirecting to signup...");
          setTimeout(() => router.push("/trial-email-signup"), 3000);
        }
      } catch (err) {
        console.error(err);
        setMsg("Unexpected error. Redirecting...");
        setTimeout(() => router.push("/trial-email-signup"), 3000);
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <p>{msg}</p>
    </div>
  );
}
