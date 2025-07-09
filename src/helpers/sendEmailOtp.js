export async function sendEmailOtp(mobile, email) {
  const response = await fetch('/api/otp-handler', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mobile, email }),
  });
  return response.json();
}
