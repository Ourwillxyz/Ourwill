// pages/auth/callback.js
import { useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../src/supabaseClient";

export default function Callback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuth = async () => {
      try {
        // Get the current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session) {
          console.error("No session:", sessionError);
          router.replace("/trial-email-signup");
          return;
        }

        const user = session.user;
        console.log("Authenticated user:", user);

        // wait a little to allow trigger insert voter row
        await new Promise(resolve => setTimeout(resolve, 5000));

        // Try finding user in voter table
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
          // redirect verified users to dashboard (adjust as needed)
          router.replace("/dashboard");
        } else {
          console.warn("No voter record found for user, redirecting...");
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
