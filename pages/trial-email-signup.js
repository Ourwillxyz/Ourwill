import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function TrialEmailSignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    setMessage("");
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: "https://ourwill.vercel.app/"
      },
    });
    if (error) {
      setMessage(error.message);
    } else {
      setMessage(
        "Registration successful! Please check your email for a link to confirm your account."
      );
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "2rem auto", border: "1px solid #eee", padding: "2rem", borderRadius: 8 }}>
      <h2>Trial Email Confirmation Signup</h2>
      <form onSubmit={handleSignup}>
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
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Choose a password"
          style={{ width: "100%", marginBottom: 12, padding: 8 }}
        />
        <button type="submit" style={{ width: "100%", padding: 10 }}>
          Sign Up & Confirm Email
        </button>
      </form>
      <p style={{ marginTop: 16, color: "#0070f3" }}>{message}</p>
    </div>
  );
}
