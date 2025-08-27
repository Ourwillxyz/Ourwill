// src/supabaseClient.js

import { createClient } from "@supabase/supabase-js"

// Get Supabase URL and Anon Key from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Optional: log env vars (remove in production)
console.log("SUPABASE URL:", supabaseUrl)
console.log("SUPABASE ANON KEY:", supabaseAnonKey)

// ✅ Named export
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
