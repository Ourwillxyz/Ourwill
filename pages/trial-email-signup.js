// pages/trial-email-signup.js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../src/supabaseClient";

export default function TrialEmailSignup() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    let intervalId;
    let countdownId;

    const checkStatus = async () => {
      try {
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const user = session.user;

        // Fetch voter status
        const { data: voter, error } = await supabase
          .from("voter")
          .select("status")
          .eq("email", user.email)
          .single();

        if (error) {
          console.error("Error checking voter:", error.message);
          return;
        }

        if (voter?.status === "verified") {
          clearInterval(intervalId);
          clearInterval(countdownId);
          router.replace("/dashboard");
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    };

    // Countdown timer
    countdownId = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) return 10; // reset when reaching 0
        return prev - 1;
      });
    }, 1000);

    // Polling every 10 seconds
    intervalId = setInterval(checkStatus, 10000);

    // Run immediately on mount
    checkStatus();

    return () => {
      clearInterval(intervalId);
      clearInterval(countdownId);
    };
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold">Waiting for Verification</h1>
      <p className="mt-2">Your account is pending verification.</p>
      <p className="mt-2 text-gray-600">
        Checking again in <span className="font-semibold">{countdown}</span> seconds...
      </p>
    </div>
  );
}
