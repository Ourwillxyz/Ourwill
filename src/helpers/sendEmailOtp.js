export const sendEmailOtp = async (email, otp) => {
  try {
    const response = await fetch('/api/send-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, otp }),
    });

    const data = await response.json();
    return data; // { success: true/false, message: "..." }
  } catch (error) {
    return { success: false, message: 'Failed to send OTP.', error: error.message };
  }
};
