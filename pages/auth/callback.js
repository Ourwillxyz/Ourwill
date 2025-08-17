// pages/auth/callback.js
import { useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../src/supabaseClient";

export default function Callback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuth = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Error getting session:", error.message);
        router.push("/login");
        return;
      }

      if (session) {
        const user = session.user;

        // ✅ Check if user already has a password set
        // If user_metadata.passwordSet is not true, send to set-password
        if (!user.user_metadata?.passwordSet) {
          router.push("/set-password");
        } else {
          router.push("/dashboard");
        }
      } else {
        // no session found, go back to login
        router.push("/login");
      }
    };

    handleAuth();
  }, [router]);

  return <p>Finishing login, please wait...</p>;
}
