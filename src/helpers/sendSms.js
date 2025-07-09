export async function sendSms(to, message) {
  const response = await fetch('http://localhost:5000/send-sms', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ to, message })
  });
  return response.json();
}
