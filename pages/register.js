// register.js

import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Register a new user with email & password
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<{user: object|null, error: object|null}>}
 */
export async function registerUser(email, password) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: 'http://localhost:3000/welcome' // Change to your app URL
    }
  })

  if (error) {
    console.error('Registration error:', error.message)
    return { user: null, error }
  }

  return { user: data.user, error: null }
}

// Example usage (you can remove this in production)
async function testRegistration() {
  const email = 'newuser@example.com'
  const password = 'StrongPassword123'
  const { user, error } = await registerUser(email, password)

  if (error) {
    console.log('❌ Error:', error.message)
  } else {
    console.log('✅ User registered:', user)
  }
}

// Run test only if script is executed directly
if (require.main === module) {
  testRegistration()
}
