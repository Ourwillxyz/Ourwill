// src/helpers/sendEmailOtp.js

export const sendEmailOtp = async (email, otp) => {
  // This check ensures the code only runs in the browser (client-side)
  if (typeof window === 'undefined') {
    return {
      success: false,
      message: 'Cannot send OTP from server-side.',
    };
  }

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
    };
  } catch (error) {
    console.error('Error in sendEmailOtp:', error);
    return {
      success: false,
      message: 'Failed to send OTP due to a network or se
