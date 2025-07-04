
import Link from 'next/link';

export default function Home() {
  return (
    <div style={{
      fontFamily: 'Arial, sans-serif',
      padding: '2rem',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <h1>Welcome to OurWill</h1>
      <p style={{ fontSize: '1.2rem' }}>
        Our Vote. Our Will. <br />
        <i>Kura Yetu. Maamuzi Yetu.</i>
      </p>

      <hr />

      <h3>Navigation</h3>
      <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
        <li><Link href="/polling/presidential">Presidential Poll</Link></li>
        <li><Link href="/about">About</Link></li>
        <li><Link href="/faq">FAQ</Link></li>
      </ul>

      <hr />

      <p style={{ color: '#777' }}>Select your country (coming soon)</p>
      <select disabled>
        <option>Kenya</option>
        <option>Ethiopia</option>
        <option>Coming Soon...</option>
      </select>
    </div>
  );
}
