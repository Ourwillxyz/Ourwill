import { useState } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function Register() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [message, setMessage] = useState("")

  const handleRegister = async (e) => {
    e.preventDefault()
    // Create user in Auth
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) {
      setMessage(error.message)
      return
    }
    // Get the user ID (UID)
    const userId = data?.user?.id
    if (userId) {
      // Insert into profiles table (add other fields as needed)
      const { error: profileError } = await supabase
        .from("profiles")
        .insert([
          { id: userId, email, full_name: fullName } // adjust column names for your schema
        ])
      if (profileError) {
        setMessage("Registered, but error saving profile: " + profileError.message)
      } else {
        setMessage("Registered! Check your email for a verification link.")
      }
    } else {
      setMessage("Registration failed: Could not get user ID.")
    }
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
      <input
        type="text"
        placeholder="Full Name"
        value={fullName}
        onChange={e => setFullName(e.target.value)}
        required
      />
      <button type="submit">Register</button>
      <p>{message}</p>
    </form>
  )
}
