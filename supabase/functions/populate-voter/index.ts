import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Edge Function: Runs on user.created webhook
serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const payload = await req.json();

  // Get secrets from environment
  const supabaseUrl = Deno.env.get("https://hhszxyvweibohlaiildw.supabase.co")!;
  const supabaseServiceRoleKey = Deno.env.get("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhoc3p4eXZ3ZWlib2hsYWlpbGR3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTc5NjY2OSwiZXhwIjoyMDY3MzcyNjY5fQ.yS2--IENup2TWsmZ8yeemirg5fsTTYNnSfjyo3kjdCk")!;
  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

  // Extract user info from webhook payload
  const { id, email } = payload?.user ?? {};

  if (!id || !email) {
    return new Response("Invalid payload: missing id or email", { status: 400 });
  }

  // Check if voter already exists
  const { data: existing } = await supabase
    .from("voter")
    .select("id")
    .eq("auth_user_id", id)
    .single();

  if (existing) {
    return new Response("Voter already exists", { status: 200 });
  }

  // Insert voter record
  const { error: insertError } = await supabase
    .from("voter")
    .insert({
      auth_user_id: id,
      email,
      username: email.split("@")[0],
      // Add other fields if needed (mobile, county, etc.)
    });

  if (insertError) {
    return new Response(`Failed to insert voter: ${insertError.message}`, { status: 500 });
  }

  return new Response("Voter inserted", { status: 200 });
});
