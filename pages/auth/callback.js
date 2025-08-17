// pages/auth/callback.js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../src/supabaseClient";

export default function Callback() {
  const [message, setMessage] = useState("Verifying login...");
  const router = useRouter();

  useEffect(() => {
    const verify = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        setMessage("❌ Error verifying login.");
        console.error(error);
        return;
      }

      if (data.session) {
        setMessage("✅ Login successful! Redirecting...");
        router.replace("/dashboard"); // change to your landing page
      } else {
        setMessage("❌ No active session found.");
        router.replace("/");
      }
    };

    verify();
  }, [router]);

  return (
    <div style={{ textAlign: "center", padding: 40 }}>
      <h2>{message}</h2>
    </div>
  );
}
