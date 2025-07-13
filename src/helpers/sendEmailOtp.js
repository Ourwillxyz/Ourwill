export async function sendEmailOtp(email, otp) {
  try {
    const res = await fetch('/api/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp }),
    });

    const data = await res.json();
    return data;
  } catch (err) {
    console.error('sendEmailOtp error:', err);
    return { success: false, message: 'Failed to send OTP' };
  }
}
