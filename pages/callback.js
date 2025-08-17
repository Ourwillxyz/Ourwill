// pages/auth/callback.js
import { useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../src/supabaseClient";

export default function Callback() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Supabase parses URL fragment automatically
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Session fetch error:", error);
          router.replace("/login?error=auth");
          return;
        }

        if (data?.session) {
          // User is authenticated 🎉
          router.replace("/dashboard");
        } else {
          // If session not yet available, try exchange
          const { data: hashData, error: hashError } =
            await supabase.auth.exchangeCodeForSession(window.location.href);

          if (hashError) {
            console.error("Exchange error:", hashError);
            router.replace("/login?error=auth");
          } else {
            router.replace("/dashboard");
          }
        }
      } catch (err) {
        console.error("Callback handling failed:", err);
        router.replace("/login?error=server");
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "1.4rem",
      }}
    >
      Verifying login...
    </div>
  );
}
