export async function sendEmailOtp(email, otp) {
  try {
    const response = await fetch('http://localhost:5000/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp })
    });
    return await response.json();
  } catch (err) {
    return { success: false, message: err.message };
  }
}
