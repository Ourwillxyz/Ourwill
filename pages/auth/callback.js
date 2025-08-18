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

        let voterData = null;
        let voterError = null;

        // Retry up to 5 times with 2s delay
        for (let attempt = 1; attempt <= 5; attempt++) {
          console.log(`Checking voter table... attempt ${attempt}`);

          const { data, error } = await supabase
            .from("voter")
            .select("*")
            .eq("id", user.id) // adjust if voter uses email instead
            .single();

          voterData = data;
          voterError = error;

          if (voterData) {
            console.log("✅ Voter record found:", voterData);
            router.push("/set-password");
            return;
          }

          console.log("⏳ No voter yet, waiting 2s before retry...");
          await new Promise(resolve => setTimeout(resolve, 2000));
        }

        // After retries, no voter found
        if (voterError) {
          console.error("Voter table error:", voterError.message);
        }
        console.log("❌ No voter record found after retries.");
        router.push("/trial-email-signup");

      } catch (err) {
        console.error("Callback error:", err.message);
        router.push("/trial-email-signup");
      }
    };

    handleAuth();
  }, [router]);

  return <p>Finishing login... please wait.</p>;
}
