require('dotenv').config({ path: '.env.local' }); // Loads your env variables

const { createClient } = require('@supabase/supabase-js');

// Get credentials from environment
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const testEmail = process.env.TEST_EMAIL;
const redirectUrl = process.env.REDIRECT_URL || 'https://your-app-url.com/reset-password';

if (!supabaseUrl || !supabaseAnonKey || !testEmail) {
  console.error('Missing required environment variables. Please check .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function sendPasswordReset() {
  const { data, error } = await supabase.auth.resetPasswordForEmail(testEmail, {
    redirectTo: redirectUrl,
  });

  if (error) {
    console.error('Error sending password reset email:', error.message);
    process.exit(1);
  } else {
    console.log('Password reset email triggered! Check the inbox for:', testEmail);
  }
}

sendPasswordReset();
