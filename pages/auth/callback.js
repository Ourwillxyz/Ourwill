// pages/auth/callback.js
import { useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../src/supabaseClient";

export default function Callback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuth = async () => {
      try {
        // IMPORTANT: exchange the code from URL into a session
        const { data, error } = await supabase.auth.exchangeCodeForSession(window.location.href);
        if (error) {
          console.error("Session exchange error:", error.message);
          router.replace("/trial-email-signup");
          return;
        }

        const { user, session } = data || {};
        if (!user || !session) {
          console.error("No user/session after exchange");
          router.replace("/trial-email-signup");
          return;
        }

        console.log("Authenticated user:", user);

        // Small delay to allow RLS/triggers to insert voter row
        await new Promise((resolve) => setTimeout(resolve, 3000));

        // Check if voter record exists
        const { data: voter, error: voterError } = await supabase
          .from("voter")
          .select("*")
          .eq("email", user.email)
          .single();

        if (voterError) {
          console.error("Error fetching voter:", voterError.message);
          router.replace("/trial-email-signup");
          return;
        }

        if (voter) {
          console.log("Voter found:", voter);
          router.replace("/dashboard");
        } else {
          console.warn("No voter record found, redirecting...");
          router.replace("/trial-email-signup");
        }
      } catch (err) {
        console.error("Unexpected error in callback:", err);
        router.replace("/trial-email-signup");
      }
    };

    handleAuth();
  }, [router]);

  return <p>Processing login... please wait.</p>;
}
