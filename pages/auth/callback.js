import { useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../src/supabaseClient";

export default function Callback() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error) {
          console.error("Error fetching user:", error.message);
          // Only go back to signup if no user exists at all
          router.replace("/trial-email-signup");
          return;
        }

        // ✅ Always redirect to set-password for magic-link users
        router.replace("/set-password");

      } catch (err) {
        console.error("Unexpected callback error:", err);
        router.replace("/trial-email-signup");
      }
    };

    handleCallback();
  }, [router]);

  return (
    <p style={{ textAlign: "center", marginTop: 60, fontSize: 18 }}>
      Finishing login... please wait.
    </p>
  );
}
