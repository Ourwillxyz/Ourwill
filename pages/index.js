// pages/index.js
import { useRouter } from 'next/router';
import Image from 'next/image';

export default function Home() {
  const router = useRouter();

  const handleRegister = () => router.push('/RegisterUser');
  const handleLogin = () => router.push('/Login');

  return (
    <div style={{
      backgroundImage: 'url("/kenya-flag.jpg")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      minHeight: '100vh',
      padding: '2rem',
      color: 'white',
      textAlign: 'center',
    }}>
      <div style={{
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        padding: '2rem',
        borderRadius: '12px',
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <Image
            src="/ourwill-logo.png"
            alt="OurWill Logo"
            width={120}
            height={120}
            style={{ margin: '0 auto' }}
          />
        </div>

        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Welcome to OurWill</h1>
        <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
          Your voice, your vote, your will. Join us in shaping a transparent and accountable democracy.
        </p>

        <div style={{ marginBottom: '2rem' }}>
          <button onClick={handleRegister} style={buttonStyle}>📝 Register</button>
          <button onClick={handleLogin} style={{ ...buttonStyle, backgroundColor: '#28a745' }}>🔐 Login</button>
        </div>

        <section style={sectionStyle}>
          <h2>📅 Upcoming Polls</h2>
          <ul style={listStyle}>
            <li>Presidential Approval Poll – Opens Aug 1, 2025</li>
            <li>County Governance Scorecard – Opens Sept 10, 2025</li>
          </ul>
        </section>

        <section style={sectionStyle}>
          <h2>📊 Past Polls & Results</h2>
          <ul style={listStyle}>
            <li>Youth Employment Survey – Closed June 2025 – 32,000 votes</li>
            <li>Public Debt Awareness – Closed May 2025 – 18,500 votes</li>
          </ul>
        </section>

        <footer style={{ marginTop: '2rem', fontSize: '0.9rem' }}>
          &copy; 2025 OurWill Platform. All rights reserved.
        </footer>
      </div>
    </div>
  );
}

const buttonStyle = {
  backgroundColor: '#007bff',
  color: 'white',
  border: 'none',
  padding: '0.75rem 1.5rem',
  fontSize: '1rem',
  borderRadius: '5px',
  margin: '0 0.5rem',
  cursor: 'pointer'
};

const sectionStyle = {
  margin: '2rem 0',
  padding: '1rem',
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  borderRadius: '10px'
};

const listStyle = {
  listStyleType: 'disc',
  paddingLeft: '1.5rem',
  textAlign: 'left',
  marginTop: '0.5rem'
};
