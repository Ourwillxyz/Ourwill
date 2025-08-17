// pages/auth/callback.js
import { useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../src/supabaseClient";

export default function Callback() {
  const router = useRouter();

  useEffect(() => {
    const finishLogin = async () => {
      const { data, error } = await supabase.auth.getSessionFromUrl({ storeSession: true });

      if (error) {
        console.error("Error finishing login:", error.message);
        // Optionally allow retry by redirecting back to trial-email-signup
        router.replace("/trial-email-signup");
        return;
      }

      const user = data?.session?.user;
      if (!user) {
        console.error("No user found in session!");
        router.replace("/trial-email-signup");
        return;
      }

      // Redirect to set-password page for first-time password setup
      router.replace("/set-password");
    };

    finishLogin();
  }, [router]);

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontSize: "1.4rem"
    }}>
      Finishing login... please wait.
    </div>
  );
}
