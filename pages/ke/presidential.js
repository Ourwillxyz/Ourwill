import { useState } from 'react';
import { wards } from '../../components/wardselector';

export default function PresidentialPoll() {
  const [selectedWard, setSelectedWard] = useState('');
  const [votes, setVotes] = useState({});
  const [voted, setVoted] = useState(false);

  const candidates = [
    { name: "David Maraga", color: "#f4a261", party: "Independent" },
    { name: "Fred Matiang'i", color: "#2a9d8f", party: "Ubuntu Party" },
    { name: "Jim Wanjigi", color: "#8d99ae", party: "Safina" },
    { name: "Kalonzo Musyoka", color: "#264653", party: "Wiper" },
    { name: "Okiya Omtata", color: "#e76f51", party: "Reform Bloc" },
    { name: "Raila Odinga", color: "#003f5c", party: "ODM" },
    { name: "William Ruto", color: "#fcbf49", party: "UDA" },
    { name: "Undecided", color: "#cccccc", party: "N/A" },
  ];

  const handleVote = (candidateName) => {
    if (!selectedWard) return alert("Please select your ward before voting.");
    if (voted) return alert("You have already voted.");

    setVotes((prevVotes) => ({
      ...prevVotes,
      [candidateName]: (prevVotes[candidateName] || 0) + 1,
    }));
    setVoted(true);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>🇰🇪 Kenya - Presidential Voting</h2>
      <p><strong>Select your ward:</strong></p>
      <select
        value={selectedWard}
        onChange={(e) => setSelectedWard(e.target.value)}
      >
        <option value="">-- Select Ward --</option>
        {wards.map((ward, idx) => (
          <option key={idx} value={ward.name}>
            {ward.name} - {ward.subcounty}, {ward.county}
          </option>
        ))}
      </select>

      <div style={{ marginTop: '20px' }}>
        <h3>Candidates</h3>
        {candidates.map((candidate, idx) => (
          <div
            key={idx}
            style={{
              backgroundColor: candidate.color,
              padding: '10px',
              marginBottom: '10px',
              borderRadius: '8px',
              color: 'white',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <strong>{candidate.name}</strong> <br />
              <small>Party: {candidate.party}</small>
            </div>
            <button
              onClick={() => handleVote(candidate.name)}
              disabled={voted}
              style={{
                padding: '6px 12px',
                backgroundColor: '#fff',
                color: candidate.color,
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Vote
            </button>
          </div>
        ))}
      </div>

      {Object.keys(votes).length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h3>Live Poll Results</h3>
          <ul>
            {Object.entries(votes).map(([name, count]) => (
              <li key={name}>
                {name}: {count} vote(s)
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
