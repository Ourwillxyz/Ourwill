import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../utils/supabaseClient";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [error, setError] = useState(null);

  useEffect(() => {
    // Get query params
    const { access_token, type } = router.query;

    // If recovery token present, show password reset form
    // Otherwise, show error or redirect
    // Your logic here...
  }, [router]);

  return (
    <div>
      <h1>Reset Password</h1>
      {/* Password reset form and error/success messages */}
      {error && <p style={{color: "red"}}>{error}</p>}
    </div>
  );
}
