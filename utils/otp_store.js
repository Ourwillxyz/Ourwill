import { supabase } from '../src/supabaseClient';
import generateOtp from './generateOtp';

/**
 * Stores a new OTP in the otp_verification table for a given email and voter_id.
 * @param {string} email - User's email address
 * @param {number} voter_id - User's voter ID
 * @param {number} [expiryMinutes=15] - OTP expiry in minutes (default 15)
 * @returns {Promise<{ success: boolean, otp?: string, error?: string }>}
 */
export async function otpStore(email, voter_id, expiryMinutes = 15) {
  try {
    // Generate OTP
    const otp = generateOtp();
    const expires_at = new Date(Date.now() + expiryMinutes * 60 * 1000).toISOString();

    // Insert OTP record in otp_verification table
    const { error } = await supabase.from('otp_verification').insert([
      {
        voter_id,
        email,
        otp,
        expires_at,
        used: false,
      }
    ]);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, otp };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export default otpStore;
