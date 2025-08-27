// pages/auth/callback.js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../src/supabaseClient";

export default function Callback() {
  const router = useRouter();
  const [msg, setMsg] = useState("Completing login…");

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      try {
        // Supabase should have detected the session in the URL already
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error || !session) {
          console.error("No session after callback:", error?.message);
          if (mounted) setMsg("No active session. Redirecting…");
          router.replace("/login");
          return;
        }

        const user = session.user;
        if (!user) {
          if (mounted) setMsg("No user found. Redirecting…");
          router.replace("/login");
          return;
        }

        // (Optional) tiny delay so DB triggers (that auto-insert profiles) complete
        await new Promise((r) => setTimeout(r, 1000));

        // Ensure there is a profiles row for this user
        const { data: existing, error: fetchErr } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

        if (fetchErr) {
          console.error("Error fetching profile:", fetchErr.message);
        }

        if (!existing) {
          // Fallback: create a minimal profile if trigger didn't (keeps UX smooth)
          const { error: insertErr } = await supabase
            .from("profiles")
            .insert([{ id: user.id, email: user.email, status: "pending" }]);

          if (insertErr) {
            console.error("Error creating profile:", insertErr.message);
            // We still continue to app; RLS/policies may block as needed
          }
        }

        // ✅ All good — route into the app
        router.replace("/dashboard");
      } catch (e) {
        console.error("Callback error:", e);
        if (mounted) setMsg("Something went wrong. Redirecting…");
        router.replace("/login");
      }
    };

    run();
    return () => { mounted = false; };
  }, [router]);

  return <p style={{ padding: 24, fontFamily: "system-ui, sans-serif" }}>{msg}</p>;
}
