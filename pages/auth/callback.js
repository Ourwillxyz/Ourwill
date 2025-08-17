// pages/auth/callback.js
import { useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../src/supabaseClient";

export default function Callback() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Session fetch error:", error);
          router.replace("/login?error=auth");
          return;
        }

        if (data?.session) {
          const user = data.session.user;

          // Check if the user has a password (Supabase does not return this directly)
          // Simple workaround: look at user.app_metadata or user.identities
          const hasPassword = user?.identities?.some(
            (id) => id.provider === "email" && id.identity_data?.password
          );

          if (!hasPassword) {
            // Redirect to password setup if user logged in via magic link or oauth
            router.replace("/set-password");
          } else {
            router.replace("/dashboard");
          }
        } else {
          const { data: hashData, error: hashError } =
            await supabase.auth.exchangeCodeForSession(window.location.href);

          if (hashError) {
            console.error("Exchange error:", hashError);
            router.replace("/login?error=auth");
          } else {
            router.replace("/set-password");
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
