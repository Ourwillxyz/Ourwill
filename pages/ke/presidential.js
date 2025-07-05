import React, { useState } from 'react';
import { wards } from '../components/WardSelector';

const candidates = [
  "David Maraga",
  "Fred Matiang'i",
  "Jim Wanjigi",
  "Kalonzo Musyoka",
  "Okiya Omtata",
  "Raila Odinga",
  "William Ruto"
];

export default function PresidentialPoll() {
  const [selectedWard, setSelectedWard] = useState('');
  const [voted, setVoted] = useState(false);
  const [voteCounts, setVoteCounts] = useState(() =>
    candidates.reduce((acc, candidate) => {
      acc[candidate] = 0;
      return acc;
    }, {})
  );

  const handleVote = (candidate) => {
    if (!selectedWard) {
      alert("Please select your ward first.");
      return;
    }

    setVoteCounts((prev) => ({
      ...prev,
      [candidate]: prev[candidate] + 1
    }));

    setVoted(true);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Presidential Poll</h1>
      <p style={{ fontStyle: 'italic', fontSize: '14px' }}>
        Names arranged alphabetically
      </p>

      <label><strong>Select your ward:</strong></label>
      <br />
      <select value={selectedWard} onChange={(e) => setSelectedWard(e.target.value)}>
        <option value="">-- Choose Ward --</option>
        {wards.map((ward, index) => (
          <option key={index} value={ward.name}>
            {ward.name} ({ward.subcounty}, {ward.county})
          </option>
        ))}
      </select>

      <br /><br />

      {!voted && selectedWard && (
        <div>
          <h3>Choose your candidate:</h3>
          {candidates.map((candidate, index) => (
            <button
              key={index}
              onClick={() => handleVote(candidate)}
              style={{ margin: '5px' }}
            >
              {candidate}
            </button>
          ))}
        </div>
      )}

      {voted && (
        <>
          <p>✅ Thank you for voting in <strong>{selectedWard}</strong></p>
          <h3>🔎 Local Poll Results (This Session)</h3>
          <table border="1" cellPadding="5">
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Votes</th>
              </tr>
            </thead>
            <tbody>
              {candidates.map((candidate, index) => (
                <tr key={index}>
                  <td>{candidate}</td>
                  <td>{voteCounts[candidate]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
