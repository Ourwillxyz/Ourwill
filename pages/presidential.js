import { useState } from 'react';
import { wards } from '../components/WardSelector';

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
  const [selectedWard, setSelectedWard] = useState('');
  const [votedCandidate, setVotedCandidate] = useState(null);

  const handleVote = (candidate) => {
    setVotedCandidate(candidate);
    // Placeholder: OTP or backend logic will go here
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Presidential Poll</h1>
      <p style={{ fontStyle: 'italic', marginBottom: '1rem' }}>
        (Disclaimer: Candidate names arranged alphabetically)
      </p>

      <h2>Select Your Ward</h2>
      <select
        value={selectedWard}
        onChange={(e) => setSelectedWard(e.target.value)}
        style={{
          padding: '0.5rem',
          fontSize: '1rem',
          marginBottom: '1rem',
          borderRadius: '5px',
          border: '1px solid #ccc',
          width: '100%'
        }}
      >
        <option value="">-- Choose Ward --</option>
        {wards.map((ward) => (
          <option key={ward.name} value={ward.name}>
            {ward.name} – {ward.subcounty}, {ward.county}
          </option>
        ))}
      </select>

      {selectedWard && (
        <>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {candidates.map((candidate) => (
              <li
                key={candidate}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1rem',
                  backgroundColor: '#f9f9f9',
                  padding: '1rem',
                  borderRadius: '8px',
                  border: '1px solid #ddd'
                }}
              >
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
              Thank you for voting for <u>{votedCandidate}</u> in <strong>{selectedWard}</strong>.
            </p>
          )}
        </>
      )}
    </div>
  );
}
Added ward selection to presidential poll
