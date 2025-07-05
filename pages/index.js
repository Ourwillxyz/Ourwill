import Link from 'next/link';

export default function Home() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Welcome to OurWill Platform</h1>
      <p>
        This platform emulates international opinion polling to track candidate consistency across time,
        helping reduce election disputes and enhance public trust.
      </p>

      <h2>🗳️ Start Polling</h2>
      <p>To vote, please verify your phone number first.</p>
      <Link href="/otp">
        <button style={{ padding: '10px', fontWeight: 'bold' }}>Verify & Vote</button>
      </Link>

      <br /><br />
      <p style={{ fontSize: '12px', fontStyle: 'italic' }}>
        All poll data is stored locally in this demo. No data is transmitted or recorded yet.
      </p>
    </div>
  );
}
