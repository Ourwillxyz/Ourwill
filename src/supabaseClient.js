import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://lswaumaimpuibcpiojmp.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxzd2F1bWFpbXB1aWJjcGlvam1wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5MTA2NTMsImV4cCI6MjA3MDQ4NjY1M30.cgaF0prz59rGPhdDlZav2kfFDT8RMvnDPoqv1KAKqmk";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
