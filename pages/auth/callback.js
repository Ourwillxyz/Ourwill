import { useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../src/supabaseClient";

export default function Callback() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Error confirming user:", error.message);
        return;
      }

      if (data?.session) {
        // ✅ Instead of login.js, send user to set-password.js
        router.replace("/set-password");
      } else {
        // If no session, fallback to register or login
        router.replace("/registerUser");
      }
    };

    handleCallback();
  }, [router]);

  return (
    <p className="text-center text-lg font-medium">
      Finishing login... please wait.
    </p>
  );
}
