import Link from 'next/link';

export default function Navbar() {
  return (
    <nav style={{
      padding: '1rem',
      backgroundColor: '#f2f2f2',
      borderBottom: '1px solid #ddd',
      marginBottom: '2rem'
    }}>
      <Link href="/" style={{ marginRight: '1rem' }}>Home</Link>
      <Link href="/presidential" style={{ marginRight: '1rem' }}>Presidential</Link>
      <Link href="/about" style={{ marginRight: '1rem' }}>About</Link>
      <Link href="/faq">FAQ</Link>
    </nav>
  );
}
