import Link from 'next/link';
import CountrySelector from '../components/CountrySelector';

export default function Home() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Welcome to OurWill Platform</h1>
      <p>
        This platform emulates international opinion polling to track candidate consistency across time,
        helping reduce election disputes and enhance public trust.
      </p>

      <h2>🌍 Select Your Country</h2>
      <CountrySelector />

      <br /><br />
      <p style={{ fontSize: '12px', fontStyle: 'italic' }}>
        All poll data is stored locally in this demo. No data is transmitted or recorded yet.
      </p>
    </div>
  );
}
