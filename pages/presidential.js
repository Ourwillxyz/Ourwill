import { useState } from 'react';

const candidates = [
  "David Maraga",
  "Fred Matiang’i",
  "Jim Wanjigi",
  "Kalonzo Musyoka",
  "Okiya Omtatah",
  "Raila Odinga",
  "William Ruto"
];

export default function PresidentialPoll() {
  const [votedCandidate, setVotedCandidate] = useState(null);

  const handleVote = (candidate) => {
    setVotedCandidate(candidate);
    // Placeholder: Later we add OTP + Backend logic here
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Presidential Poll</h1>
      <p style={{ fontStyle: 'italic', marginBottom: '1rem' }}>
        (Disclaimer: Candidate names arranged alphabetically)
      </p>

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {candidates.map((candidate) => (
          <li key={candidate} style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
            backgroundColor: '#f9f9f9',
            padding: '1rem',
            borderRadius: '8px',
            border: '1px solid #ddd'
          }}>
            <span>{candidate}</span>
            <button
              onClick={() => handleVote(candidate)}
              disabled={votedCandidate !== null}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#0080ff',
                color: '#fff',
                border: 'none',
                borderRadius: '5px',
                cursor: votedCandidate ? 'not-allowed' : 'pointer'
              }}
            >
              {votedCandidate === candidate ? 'Voted' : 'Vote'}
            </button>
          </li>
        ))}
      </ul>

      {votedCandidate && (
        <p style={{ color: 'green', fontWeight: 'bold', marginTop: '2rem' }}>
          Thank you for voting for <u>{votedCandidate}</u>.
        </p>
      )}
    </div>
  );
}
