import Link from 'next/link';
import Image from 'next/image';

export default function Navbar() {
  return (
    <nav style={{
      display: 'flex',
      alignItems: 'center',
      padding: '1rem',
      backgroundColor: '#f2f2f2',
      borderBottom: '1px solid #ddd',
      marginBottom: '2rem'
    }}>
      <Link href="/" style={{ marginRight: '2rem' }}>
        <Image
          src="/ourwill-logo.png"
          alt="OurWill Logo"
          width={160}
          height={160}
          style={{ borderRadius: '50%' }}
        />
      </Link>
      <div>
        <Link href="/" style={{ marginRight: '1rem' }}>Home</Link>
        <Link href="/presidential" style={{ marginRight: '1rem' }}>Presidential</Link>
        <Link href="/about" style={{ marginRight: '1rem' }}>About</Link>
        <Link href="/faq">FAQ</Link>
      </div>
    </nav>
  );
}
