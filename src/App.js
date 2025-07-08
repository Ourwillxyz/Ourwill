import React, { useState } from "react";

export default function App() {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [message, setMessage] = useState("");

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    if (form.password !== form.confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }
    try {
      // CHANGE THIS URL to your real backend registration endpoint!
      const response = await fetch("https://your-backend.com/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password
        })
      });
      if (!response.ok) throw new Error("Registration failed");
      setMessage("Registration successful! You can now log in.");
      setForm({ name: "", email: "", password: "", confirmPassword: "" });
    } catch (err) {
      setMessage(err.message);
    }
  }

  return (
    <main style={{ maxWidth: 400, margin: "2em auto", padding: 20, border: "1px solid #ccc", borderRadius: 8 }}>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <input name="name" placeholder="Full Name" value={form.name} onChange={handleChange} required style={{ width: "100%", marginBottom: 10, padding: 8 }} />
        </div>
        <div>
          <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required style={{ width: "100%", marginBottom: 10, padding: 8 }} />
        </div>
        <div>
          <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required style={{ width: "100%", marginBottom: 10, padding: 8 }} />
        </div>
        <div>
          <input name="confirmPassword" type="password" placeholder="Confirm Password" value={form.confirmPassword} onChange={handleChange} required style={{ width: "100%", marginBottom: 10, padding: 8 }} />
        </div>
        <button type="submit" style={{ width: "100%", padding: 10, background: "#0070f3", color: "white", border: "none", borderRadius: 4 }}>Register</button>
      </form>
      {message && <div style={{ marginTop: 10, color: message.includes("successful") ? "green" : "red" }}>{message}</div>}
    </main>
  );
}
