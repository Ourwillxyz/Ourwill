import { useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../src/supabaseClient";

export default function Callback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuth = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Error fetching session:", error.message);
        router.push("/login");
        return;
      }

      const session = data?.session;
      if (!session) {
        router.push("/login");
        return;
      }

      const user = session.user;

      // 👉 If user has no password yet, redirect to set-password
      if (!user.user_metadata?.has_password) {
        router.push("/set-password");
      } else {
        router.push("/dashboard");
      }
    };

    handleAuth();
  }, [router]);

  return <p>Finishing login... please wait.</p>;
}
