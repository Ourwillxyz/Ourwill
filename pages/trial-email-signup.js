// pages/trial-email-signup.js

import { useState } from "react";
import { supabase } from "../src/supabaseClient"; // ✅ Correct path

export default function TrialEmailSignup() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Signup with Supabase magic link
  const signUpWithEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm?redirectTo=/dashboard`,
          shouldCreateUser: true,
        },
      });

      if (error) {
        console.error("Signup Error:", error.message);
        setMessage("❌ " + error.message);
      } else {
        console.log("Signup Data:", data);
        setMessage("✅ Check your email for a confirmation link.");
      }
    } catch (err) {
      console.error("Unexpected Error:", err);
      setMessage("⚠️ Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Trial Email Signup (Magic Link)</h1>
      <form onSubmit={signUpWithEmail}>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: "0.5rem", marginRight: "0.5rem" }}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Sending..." : "Sign Up"}
        </button>
      </form>

      {message && (
        <p style={{ marginTop: "1rem", fontWeight: "bold" }}>{message}</p>
      )}
    </div>
  );
}
