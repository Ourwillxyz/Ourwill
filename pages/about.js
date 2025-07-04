import Navbar from '../components/Navbar';

export default function About() {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif' }}>
      <Navbar />
      <div style={{ padding: '2rem' }}>
        <h1>About OurWill</h1>
        <p>OurWill is a citizen-led polling platform tracking electoral consistency across Africa.</p>
      </div>
    </div>
  );
}
