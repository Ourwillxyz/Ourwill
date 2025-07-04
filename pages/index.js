import Navbar from '../components/Navbar';

export default function Home() {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif' }}>
      <Navbar />
      <div style={{ padding: '2rem' }}>
        <h1>Welcome to OurWill Platform</h1>
        <p>Track presidential consistency over time. Your voice, your vote, your will.</p>
      </div>
    </div>
  );
}
