import { useState } from "react"
import { createClient } from "@supabase/supabase-js"

// Uses your .env.local values
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function Register() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")

  const handleRegister = async (e) => {
    e.preventDefault()

    // Register using only Supabase Auth
    const { error } = await supabase.auth.signUp({ email, password })

    if (error) {
      setMessage(`Error: ${error.message}`)
      console.error(error)
      return
    }
    setMessage("Registration successful! Check your email for a verification link.")
  }

  return (
    <form onSubmit={handleRegister}>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
      />
      <button type="submit">Register</button>
      <p>{message}</p>
    </form>
  )
}
