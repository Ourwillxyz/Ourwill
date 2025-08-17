// pages/auth/callback.js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../src/supabaseClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Callback() {
  const [status, setStatus] = useState("Verifying login...");
  const router = useRouter();

  useEffect(() => {
    const handleSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          setStatus("Verification failed. Please try again.");
          console.error(error);
          return;
        }

        if (data?.session) {
          // If user just signed up with magic link → force them to set password
          router.replace("/set-password");
        } else {
          setStatus("No active session found. Please try again.");
        }
      } catch (err) {
        console.error(err);
        setStatus("Unexpected error occurred.");
      }
    };

    handleSession();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md shadow-lg">
        <CardContent className="p-6 text-center">
          <h1 className="text-xl font-semibold mb-4">Authentication</h1>
          <p className="text-gray-600 mb-6">{status}</p>
          {status.includes("failed") || status.includes("No active session") ? (
            <Button onClick={() => router.push("/login")}>Go to Login</Button>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
