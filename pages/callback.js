// Check if email is already used
const { data: emailUsed } = await supabase
  .from('voter')
  .select('id')
  .eq('email', email)
  .maybeSingle();

if (emailUsed) {
  setMessage('❌ This email is already registered.');
  return;
}

// Check if mobile is already used
const { data: mobileUsed } = await supabase
  .from('voter')
  .select('id')
  .eq('mobile', mobile)
  .maybeSingle();

if (mobileUsed) {
  setMessage('❌ This mobile number is already registered.');
  return;
}

// Check if username is already used
const { data: usernameUsed } = await supabase
  .from('voter')
  .select('id')
  .eq('username', username)
  .maybeSingle();

if (usernameUsed) {
  setMessage('❌ This username is already taken.');
  return;
}
