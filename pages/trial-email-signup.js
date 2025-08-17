import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function TrialMagicLinkSignUp() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleMagicLink = async (e) => {
    e.preventDefault();
    setMessage("");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true }
    });
    if (error) {
      setMessage(error.message);
    } else {
      setMessage(
        "Check your email for a magic link to sign in instantly!"
      );
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "2rem auto", border: "1px solid #eee", padding: "2rem", borderRadius: 8 }}>
      <h2>Try Our App Instantly</h2>
      <form onSubmit={handleMagicLink}>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Enter your email"
          style={{ width: "100%", marginBottom: 12, padding: 8 }}
        />
        <button type="submit" style={{ width: "100%", padding: 10 }}>
          Get Magic Link
        </button>
      </form>
      <p style={{ marginTop: 16, color: "#0070f3" }}>{message}</p>
    </div>
  );
}
