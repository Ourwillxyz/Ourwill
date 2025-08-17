// pages/callback.js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../src/supabaseClient";
import sha256 from "crypto-js/sha256";

export default function Callback() {
  const [message, setMessage] = useState("Verifying...");
  const router = useRouter();

  useEffect(() => {
    const verifyUser = async () => {
      try {
        // Step 1: Get or exchange session
        let sessionResponse;

        if (router.query.code) {
          // Case: redirect returned ?code=... (use exchangeCodeForSession)
          sessionResponse = await supabase.auth.exchangeCodeForSession(router.query.code);
        } else {
          // Case: redirect returned #access_token=... (default magic link)
          sessionResponse = await supabase.auth.getSession();
        }

        if (sessionResponse.error) {
          console.error("Auth session error:", sessionResponse.error.message);
          setMessage("❌ Invalid or expired link.");
          return;
        }

        const session = sessionResponse.data?.session;
        if (!session?.user?.email) {
          setMessage("❌ Could not retrieve user session.");
          return;
        }

        const email = session.user.email;

        // Step 2: Retrieve pending registration data
        const pending = JSON.parse(localStorage.getItem("pending_registration") || "{}");
        const { username, mobile, county, subcounty, ward, polling_centre } = pending;

        if (!username || !mobile || !county || !subcounty || !ward || !polling_centre) {
          setMessage("❌ Missing registration data.");
          return;
        }

        // Step 3: Create a hash of voter identity
        const voterHash = sha256(`${email}:${mobile}:${username}`).toString();

        // Step 4: Check for existing voter
        const { data: existing, error: existingError } = await supabase
          .from("voter")
          .select("id")
          .eq("voter_hash", voterHash)
          .maybeSingle();

        if (existingError) {
          console.error("Error checking voter:", existingError);
          setMessage("❌ Failed to check existing voter.");
          return;
        }

        if (existing?.id) {
          setMessage("❌ This account is already registered.");
          return;
        }

        // Step 5: Insert new voter record
        const { error: insertError } = await supabase.from("voter").insert([
          {
            username,
            email: null, // ⚠️ consider storing encrypted instead of null
            mobile: null,
            county,
            subcounty,
            ward,
            polling_centre,
            voter_hash: voterHash,
            status: "verified",
          },
        ]);

        if (insertError) {
          console.error("Insert error:", insertError);
          setMessage("❌ Failed to save voter record.");
          return;
        }

        // Step 6: Cleanup and redirect
        localStorage.removeItem("pending_registration");
        setMessage("✅ Registration complete! Redirecting...");
        router.replace("/dashboard");

      } catch (error) {
        console.error("Unexpected error:", error);
        setMessage("❌ Something went wrong.");
      }
    };

    if (router.isReady) {
      verifyUser();
    }
  }, [router]);

  return (
    <div style={{ padding: 40, textAlign: "center" }}>
      <h2>{message}</h2>
    </div>
  );
}
