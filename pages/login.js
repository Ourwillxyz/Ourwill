// pages/login.js
import { useState } from "react";
import { supabase } from "../src/supabaseClient";

export default function Login() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");
    setSending(true);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        // Where the user will land after clicking the email link:
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) setMessage(`❌ ${error.message}`);
    else setMessage("✅ Check your email for a magic login link.");

    setSending(false);
  };

  return (
    <div style={{ maxWidth: 420, margin: "3rem auto", fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ marginBottom: 16 }}>Sign in with Magic Link</h1>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{
            width: "100%",
            padding: "12px 14px",
            borderRadius: 8,
            border: "1px solid #d1d5db",
            marginBottom: 12,
          }}
        />
        <button
          type="submit"
          disabled={sending || !email}
          style={{
            width: "100%",
            padding: "12px 14px",
            borderRadius: 8,
            border: "none",
            background: sending ? "#a5b4fc" : "#4f46e5",
            color: "#fff",
            fontWeight: 600,
            cursor: sending ? "not-allowed" : "pointer",
          }}
        >
          {sending ? "Sending..." : "Send Magic Link"}
        </button>
      </form>
      {message && <p style={{ marginTop: 12 }}>{message}</p>}

      <p style={{ marginTop: 24, color: "#6b7280", fontSize: 14 }}>
        You’ll receive an email with a secure link. Click it to finish sign-in.
      </p>
    </div>
  );
}
