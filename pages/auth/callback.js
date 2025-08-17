// pages/auth/callback.js
import { useEffect } from "react";
import { useRouter } from "next/router";
import supabase from "../../src/supabaseClient";  // 👈 fixed path

export default function Callback() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("Error fetching session:", error.message);
          router.push("/login");
          return;
        }

        if (!session) {
          console.error("No active session found.");
          router.push("/login");
          return;
        }

        const user = session.user;
        const hasPassword = user.app_metadata?.provider === "email";

        if (!hasPassword) {
          router.push("/set-password");
        } else {
          router.push("/dashboard");
        }
      } catch (err) {
        console.error("Callback error:", err);
        router.push("/login");
      }
    };

    handleCallback();
  }, [router]);

  return <p>Finishing login, please wait...</p>;
}
