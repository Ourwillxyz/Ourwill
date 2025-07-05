import { useState } from 'react';
import { wards } from '../../components/WardSelector';

export default function PresidentialPoll() {
  const [selectedWard, setSelectedWard] = useState('');
  const [voted, setVoted] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const candidates = [
    { name: "David Maraga", party: "Independent" },
    { name: "Fred Matiang'i", party: "Independent" },
    { name: "Jim Wanjigi", party: "Safina" },
    { name: "Kalonzo Musyoka", party: "Wiper" },
    { name: "Okiya Omtata", party: "Independent" },
    { name: "Raila Odinga", party: "ODM" },
    { name: "William Ruto", party: "UDA" },
    { name: "Undecided", party: "None" },
  ];

  const handleVote = (candidate) => {
    setSelectedCandidate(candidate);
    setVoted(true);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>🇰🇪 Kenya - Presidential Poll</h2>

      <label>Select Your Ward:</label>
      <select value={selectedWard} onChange={(e) => setSelectedWard(e.target.value)}>
        <option value="">-- Choose Ward --</option>
        {wards.map((ward, index) => (
          <option key={index} value={ward.name}>
            {ward.name} - {ward.subcounty}, {ward.county}
          </option>
        ))}
      </select>

      {selectedWard && !voted && (
        <div style={{ marginTop: '20px' }}>
          <h3>Candidates:</h3>
          {candidates.map((candidate, index) => (
            <div key={index} style={{
              border: '1px solid #ccc',
              padding: '12px',
              marginBottom: '12px',
              borderRadius: '8px'
            }}>
              <h4>{candidate.name}</h4>
              <p>Party: {candidate.party}</p>
              <p><em>[Party Symbol Placeholder]</em></p>
              <button onClick={() => handleVote(candidate.name)}>Vote</button>
            </div>
          ))}
        </div>
      )}

      {voted && (
        <div style={{ marginTop: '20px', color: 'green' }}>
          <h3>✅ You voted for: {selectedCandidate}</h3>
        </div>
      )}
    </div>
  );
}
