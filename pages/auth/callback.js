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

      if (!session) {
        router.push("/login");
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      // Check if user has a password set (email provider means password login enabled)
      const hasPassword = user.app_metadata?.provider === "email";

      if (!hasPassword) {
        router.push("/set-password");
      } else {
        router.push("/dashboard");
      }
    };

    handleAuth();
  }, [router]);

  return <p>Finishing login, please wait...</p>;
}
