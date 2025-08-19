import { supabase } from "../supabaseClient"

export default function TrialEmailSignup() {
  const handleSignup = async () => {
    const email = "testuser@example.com" // test email
    const { data, error } = await supabase.auth.signUp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/confirm`, 
        shouldCreateUser: true,
      }
    })

    if (error) {
      console.error("Signup Error:", error.message)
      alert("Error signing up: " + error.message)
    } else {
      console.log("Signup success:", data)
      alert("Check your email for a confirmation link")
    }
  }

  return (
    <div>
      <button onClick={handleSignup}>Sign up with Magic Link</button>
    </div>
  )
}
