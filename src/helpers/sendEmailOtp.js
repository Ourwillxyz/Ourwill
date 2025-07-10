// sendEmailOtp.js

/**
 * Sends a POST request to the backend to trigger an OTP email.
 * @param {string} email - The user's email address.
 * @param {string} otp - The OTP code to send.
 * @returns {Promise<{success: boolean, message?: string, error?: string}>}
 */
export async function sendEmailOtp(email, otp) {
  try {
    const response = await fetch('http://localhost:5000/send-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, otp })
    });

    // Parse the JSON response
    const result = await response.json();

    return result;
  } catch (error) {
    return { success: false, message: error.message || 'Network error' };
  }
}
