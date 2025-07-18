/**
 * Generates a random 6-digit OTP code as a string.
 * @returns {string} 6-digit OTP
 */
function generateOtp() {
  // Generates a number between 100000 and 999999, then converts to string
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export default generateOtp;
