const handleSubmit = async (e) => {
  e.preventDefault();
  setErrorMsg('');
  setSuccessMsg('');
  setLoading(true);

  // Normalize email: trim whitespace and lowercase
  const inputEmail = email.trim().toLowerCase();
  console.log("Checking voter for email:", inputEmail);

  // 1. Check if voter exists
  const { data: voter, error } = await supabase
    .from('voter')
    .select('*')
    .eq('email', inputEmail)
    .single();

  if (error) {
    setErrorMsg('Database error: ' + error.message);
    setLoading(false);
    return;
  }

  if (!voter) {
    setErrorMsg('No voter found with this email. Please register first.');
    setLoading(false);
    return;
  }

  // 2. Generate OTP and store in otp_verification
  const otp = generateOtp();
  const { error: otpError } = await supabase.from('otp_verification').insert([
    {
      email: inputEmail, // Store normalized email
      otp,
      expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 min expiry
      used: false,
      purpose: 'login'
    }
  ]);
  if (otpError) {
    setErrorMsg('Failed to store OTP: ' + otpError.message);
    setLoading(false);
    return;
  }

  // 3. Send OTP
  const sent = await sendOtpEmail(inputEmail, otp);
  if (!sent) {
    setLoading(false);
    return;
  }

  setSuccessMsg('OTP sent! Please check your email.');

  // 4. Redirect to verify page
  setTimeout(() => {
    router.push({
      pathname: '/verify',
      query: {
        email: inputEmail,
        mode: 'login'
      }
    });
  }, 1500);

  setLoading(false);
};
