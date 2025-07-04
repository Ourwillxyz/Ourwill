import Navbar from '../components/Navbar';

export default function Presidential() {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif' }}>
      <Navbar />
      <div style={{ padding: '2rem' }}>
        <h1>Presidential Polls</h1>
        <p>This page will show ongoing presidential polls and consistency trends.</p>
      </div>
    </div>
  );
}
