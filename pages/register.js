// pages/register.js

import { useState } from "react"
import { supabase } from "../src/supabaseClient"

export default function Register() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")

  const handleRegister = async (e) => {
    e.preventDefault()

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: "http://localhost:3000/welcome" // 👈 update for production
      }
    })

    if (error) {
      setMessage("❌ " + error.message)
    } else {
      setMessage("✅ Check your email for a confirmation link!")
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: "2rem auto" }}>
      <h1>Create Account</h1>
      <form onSubmit={handleRegister}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ display: "block", marginBottom: "10px", width: "100%" }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ display: "block", marginBottom: "10px", width: "100%" }}
        />
        <button type="submit">Register</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  )
}
