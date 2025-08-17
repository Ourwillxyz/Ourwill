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
          router.replace("/trial-email-signup");
          return;
        }

        if (user) {
          // Check if password is set (new users will have null password hash)
          // Supabase does not expose password hash directly, so assume new users go to set-password
          router.replace("/set-password");
        } else {
          router.replace("/trial-email-signup");
        }
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
