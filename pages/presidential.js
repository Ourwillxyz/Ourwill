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

  const handleVote = (candidate) => {
    if (selectedWard) {
      setVoted(true);
    } else {
      alert("Please select your ward first.");
    }
  };

  return (
    <div>
      <h1>Presidential Poll</h1>
      <p style={{ fontStyle: 'italic', fontSize: '14px' }}>Names arranged alphabetically</p>

      <label>Select your ward:</label>
      <select value={selectedWard} onChange={(e) => setSelectedWard(e.target.value)}>
        <option value="">-- Choose Ward --</option>
        {wards.map((ward, index) => (
          <option key={index} value={ward.name}>
            {ward.name} ({ward.subcounty}, {ward.county})
          </option>
        ))}
      </select>

      <br /><br />

      {selectedWard && !voted && (
        <div>
          <h3>Choose your candidate:</h3>
          <ul>
            {candidates.map((candidate, index) => (
              <li key={index}>
                <button onClick={() => handleVote(candidate)}>{candidate}</button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {voted && (
        <p>Thank you for voting!</p>
      )}
    </div>
  );
}
