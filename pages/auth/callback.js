// pages/auth/callback.js
import { useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../supabaseClient";

export default function Callback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuth = async () => {
      // Get the session from Supabase
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Error getting session:", error.message);
        router.push("/login"); // fallback
        return;
      }

      if (!session) {
        router.push("/login");
        return;
      }

      // Get the logged-in user
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      // Check if the user has a password set
      // Supabase stores identities (OAuth, email, etc.)
      const hasPassword = user.app_metadata?.provider === "email";

      if (!hasPassword) {
        // If no password, send to set-password page
        router.push("/set-password");
      } else {
        // Otherwise send to dashboard
        router.push("/dashboard");
      }
    };

    handleAuth();
  }, [router]);

  return <p>Finishing login, please wait...</p>;
}
