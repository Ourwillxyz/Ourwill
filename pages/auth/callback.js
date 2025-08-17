// pages/auth/callback.js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../src/supabaseClient";

export default function Callback() {
  const router = useRouter();
  const [message, setMessage] = useState("Finishing login... please wait.");

  useEffect(() => {
    const handleLoginCallback = async () => {
      try {
        // Get URL params
        const { data, error } = await supabase.auth.getSessionFromUrl({ storeSession: true });

        if (error) {
          setMessage("Error finishing login: " + error.message);
          console.error("Auth callback error:", error);
          return;
        }

        const user = data?.session?.user;
        if (!user) {
          setMessage("No user found. Please try signing in again.");
          return;
        }

        // Check if the user has a password set
        // Supabase does not allow direct password check,
        // so we redirect to set-password page if first-time login
        // You may also use a metadata flag if you already set one
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profileError && profileError.code !== "PGRST116") {
          console.error("Profile fetch error:", profileError);
        }

        if (!profile) {
          // First-time login: redirect to set password
          router.replace("/set-password");
        } else {
          // Existing user: redirect to dashboard
          router.replace("/dashboard");
        }
      } catch (err) {
        console.error("Unexpected error in callback:", err);
        setMessage("Unexpected error. Please try again.");
      }
    };

    handleLoginCallback();
  }, [router]);

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontSize: "1.3rem",
      padding: "1rem",
      textAlign: "center"
    }}>
      {message}
    </div>
  );
}
