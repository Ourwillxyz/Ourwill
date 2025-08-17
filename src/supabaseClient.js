import { createClient } from "@supabase/supabase-js";

// Log the environment variables to verify they are loaded correctly
console.log("SUPABASE URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log("SUPABASE ANON KEY:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

// Get Supabase URL and Anon Key from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create the Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
