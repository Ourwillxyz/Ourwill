/**
 * Helper function to send OTP to user's email via backend API
 * Usage: await sendEmailOtp(email, otp)
 */
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
    return {
      success: response.ok,
      message: data.message || 'No message returned',
      error: data.error || null,
    };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to send OTP due to a network or server error.',
      error: error.message,
    };
  }
};
