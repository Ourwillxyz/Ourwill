import { supabase } from '../src/supabaseClient';

/**
 * Verifies the OTP for a given email (or voter_id).
 * Checks for: correct OTP, not expired, not used.
 * Marks OTP as used if successful.
 *
 * @param {string} email - User's email address
 * @param {string} otp - OTP entered by the user
 * @returns {Promise<{ success: boolean, error?: string, voter_id?: number }>}
 */
export async function otpVerify(email, otp) {
  try {
    // Find valid, unused, unexpired OTP
    const { data: otpRecord, error: queryError } = await supabase
      .from('otp_verification')
      .select('*')
      .eq('email', email)
      .eq('otp', otp)
      .eq('used', false)
      .gte('expires_at', new Date().toISOString())
      .single();

    if (queryError) {
      return { success: false, error: queryError.message };
    }
    if (!otpRecord) {
      return { success: false, error: 'Invalid, expired or already used OTP.' };
    }

    // Mark OTP as used
    const { error: updateError } = await supabase
      .from('otp_verification')
      .update({ used: true })
      .eq('id', otpRecord.id);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    return { success: true, voter_id: otpRecord.voter_id };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export default otpVerify;
