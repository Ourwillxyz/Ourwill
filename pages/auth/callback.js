// pages/auth/callback.js
import { useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../src/supabaseClient";

export default function Callback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuth = async () => {
      try {
        // Get Supabase session
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error || !session) {
          console.error("Session error:", error);
          router.push("/trial-email-signup");
          return;
        }

        const user = session.user;
        console.log("Auth user:", user);

        // Add delay to allow voter record to be created
        await new Promise(resolve => setTimeout(resolve, 2000)); // 2s delay

        // Check voter table
        const { data: voterData, error: voterError } = await supabase
          .from("voter")
          .select("*")
          .eq("id", user.id) // assuming voter.id matches auth.users.id
          .single();

        if (voterError) {
          console.error("Voter table error:", voterError.message);
          router.push("/trial-email-signup");
          return;
        }

        if (voterData) {
          console.log("Voter record found:", voterData);
          router.push("/set-password");
        } else {
          console.log("No voter record found, redirecting...");
          router.push("/trial-email-signup");
        }
      } catch (err) {
        console.error("Callback error:", err.message);
        router.push("/trial-email-signup");
      }
    };

    handleAuth();
  }, [router]);

  return <p>Finishing login... please wait.</p>;
}
