import { useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../src/supabaseClient"; // adjust path as needed

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    // Supabase signup
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage("Registration successful! Please check your email to verify your account before logging in.");
      setEmail("");
      setPassword("");
      // Optionally redirect to login here
      // router.push("/login");
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 400, margin: "auto", padding: 24 }}>
      <h2>User Registration</h2>
      <form onSubmit={handleRegister}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          required
          onChange={e => setEmail(e.target.value)}
          style={{ width: "100%", marginBottom: 12, padding: 8 }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          required
          onChange={e => setPassword(e.target.value)}
          style={{ width: "100%", marginBottom: 12, padding: 8 }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{ width: "100%", padding: 8 }}
        >
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
      {error && <div style={{ color: "red", marginTop: 12 }}>{error}</div>}
      {message && <div style={{ color: "green", marginTop: 12 }}>{message}</div>}
    </div>
  );
}
