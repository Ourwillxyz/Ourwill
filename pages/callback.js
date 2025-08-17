// pages/auth/callback.js
import { useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../supabaseClient";

export default function Callback() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Error getting session:", error.message);
        return;
      }

      if (data?.session) {
        // Redirect to set password page
        router.push("/set-password");
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
      <h2>Verifying login...</h2>
      <p>Please wait while we confirm your email.</p>
    </div>
  );
}
