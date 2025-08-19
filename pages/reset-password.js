import { useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../src/supabaseClient";

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    // Actually update password via Supabase
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      setError(error.message);
    } else {
      setMessage("Password reset successful! You can now log in.");
      // Optionally redirect to login after a short delay
      setTimeout(() => {
        router.push("/login");
      }, 2500);
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: "100vh",
      width: "100vw",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #ece9f7 0%, #fff 100%)"
    }}>
      <form
        onSubmit={handleReset}
        style={{
          background: "#fff",
          padding: "2rem",
          borderRadius: 16,
          boxShadow: "0 4px 24px rgba(0,0,0,0.17)",
          width: "100%",
          maxWidth: 400,
        }}
      >
        <h2 style={{ color: "#4733a8", marginBottom: 16 }}>Reset Your Password</h2>
        <input
          type="password"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
          placeholder="Enter your new password"
          required
          style={{
            width: "100%",
            padding: "12px 16px",
            marginBottom: 16,
            borderRadius: 8,
            border: "1px solid #d1d5db",
            fontSize: "1rem",
            background: "#f7f7fa"
          }}
        />
        <button
          type="submit"
          disabled={loading || !newPassword}
          style={{
            width: "100%",
            padding: "12px 0",
            borderRadius: 8,
            border: "none",
            background: loading ? "#a5b4fc" : "#4f46e5",
            color: "#fff",
            fontWeight: 600,
            fontSize: "1rem",
            cursor: loading ? "not-allowed" : "pointer",
            transition: "background 0.2s"
          }}
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>
        {error && (
          <div
            style={{
              marginTop: 16,
              color: "#dc2626",
              fontWeight: 500
            }}
          >
            {error}
          </div>
        )}
        {message && (
          <div
            style={{
              marginTop: 16,
              color: "#22c55e",
              fontWeight: 500
            }}
          >
            {message}
          </div>
        )}
      </form>
    </div>
  );
}
