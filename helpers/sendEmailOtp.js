// helpers/sendEmailOtp.js

export const sendEmailOtp = async (email, otp) => {
  try {
    const response = await fetch("/api/send-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, otp }),
    });

    const data = await response.json();

    return {
      success: response.ok,
      message: data.message,
    };
  } catch (error) {
    console.error("Error in sendEmailOtp:", error);
    return {
      success: false,
      message: "Failed to send OTP",
    };
  }
};
