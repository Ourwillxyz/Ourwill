import { useState } from 'react';
import { wards } from '../../components/WardSelector';

const candidates = [
  { name: 'Hon. Peter Kiptoo', color: '#FF4136' },
  { name: 'Hon. Wanjiru Mwangi', color: '#B10DC9' },
  { name: 'Hon. Yusuf Abdi', color: '#01FF70' },
];

export default function MPPoll() {
  const [selectedWard, setSelectedWard] = useState('');
  const [votes, setVotes] = useState({});
  const [votedCandidate, setVotedCandidate] = useState('');

  const handleVote = (candidateName) => {
    if (!selectedWard) return alert('Please select a ward before voting.');
    const key = `${selectedWard}-${candidateName}`;
    setVotes(prev => ({ ...prev, [key]: (prev[key] || 0) + 1 }));
    setVotedCandidate(candidateName);
  };

  const getResultsByWard = () => {
    const results = {};
    Object.entries(votes).forEach(([key, count]) => {
      const [ward, candidate] = key.split('-');
      if (!results[ward]) results[ward] = {};
      results[ward][candidate] = count;
    });
    return results;
  };

  const results = getResultsByWard();

  return (
    <div>
      <h2>🇰🇪 Kenya - MP Voting</h2>

      <select onChange={e => setSelectedWard(e.target.value)} value={selectedWard}>
        <option value="">Select Ward</option>
        {wards.map((w, idx) => (
          <option key={idx} value={w.name}>{w.name}</option>
        ))}
      </select>

      <h4 style={{ marginTop: '20px' }}>Select Your Candidate:</h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', margin: '10px 0' }}>
        {candidates.map((c) => (
          <button
            key={c.name}
            onClick={() => handleVote(c.name)}
            style={{
              backgroundColor: c.color,
              color: '#fff',
              border: 'none',
              padding: '10px',
              borderRadius: '5px',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            {/* Placeholder for future logo or symbol */}
            <strong>{c.name}</strong>
          </button>
        ))}
      </div>

      {votedCandidate && (
        <p>✅ You voted for <strong>{votedCandidate}</strong> in {selectedWard}</p>
      )}

      {Object.keys(results).length > 0 && (
        <div>
          <h3>Results by Ward</h3>
          {Object.entries(results).map(([ward, wardVotes]) => (
            <div key={ward}>
              <strong>{ward}</strong>
              <ul>
                {Object.entries(wardVotes).map(([candidate, count]) => (
                  <li key={candidate}>
                    {candidate}: {count} votes
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
