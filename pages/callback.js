// pages/auth/callback.js
import { useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../src/supabaseClient"; // ✅ fixed import
import { Card, CardContent } from "../../components/ui/card"; // ✅ relative import
import { Button } from "../../components/ui/button"; // ✅ relative import

export default function Callback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuth = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Error fetching session:", error.message);
        return;
      }

      if (data?.session) {
        // Redirect to set password
        router.push("/set-password");
      }
    };

    handleAuth();
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md shadow-lg rounded-2xl">
        <CardContent className="p-6 text-center">
          <h2 className="text-xl font-bold mb-4">Verifying login...</h2>
          <p className="text-gray-600 mb-6">
            Please wait while we confirm your authentication.
          </p>
          <Button disabled>Processing...</Button>
        </CardContent>
      </Card>
    </div>
  );
}
