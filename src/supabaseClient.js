import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://hhszxyvweibohlaiildw.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhoc3p4eXZ3ZWlib2hsYWlpbGR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3OTY2NjksImV4cCI6MjA2NzM3MjY2OX0.QAdLfaXwhYInGF4lnBEcSNLFeva60iAV5_3Nb5P3gqE";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
