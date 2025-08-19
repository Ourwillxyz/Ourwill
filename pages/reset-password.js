import { useState } from "react";
import { useRouter } from "next/router";
// import { supabase } from "../utils/supabaseClient"; // Uncomment if you have Supabase set up

export default function ResetPasswordPage() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleReset = async (e) => {
    e.preventDefault();

    // Example: Get access_token from query params
    const { access_token, type } = router.query;

    // TODO: Connect with Supabase password update API here
    // Example:
    // const { error } = await supabase.auth.api.updateUser(access_token, { password: newPassword });
    // if (error) setError(error.message);
    // else setMessage("Password reset successful!");

    // For now, just show a fake success message
    setMessage("Password reset submitted! (Implement Supabase logic here)");
  };

  return (
    <div style={{ maxWidth: 400, margin: "2rem auto", padding: 16, border: "1px solid #ccc", borderRadius: 8 }}>
      <h2>Reset Password</h2>
      <form onSubmit={handleReset}>
        <label>
          New Password:
          <input
            type="password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            required
            style={{ width: "100%", marginBottom: 12 }}
          />
        </label>
        <button type="submit" style={{ width: "100%" }}>Reset Password</button>
      </form>
      {error && <div style={{ color: "red", marginTop: 8 }}>{error}</div>}
      {message && <div style={{ color: "green", marginTop: 8 }}>{message}</div>}
    </div>
  );
}
