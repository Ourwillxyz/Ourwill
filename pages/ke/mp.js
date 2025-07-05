import { useState } from 'react';
import { wards } from '../../components/WardSelector';

const candidates = [
  { name: 'Hon. Peter Kiptoo', color: '#FF4136' },
  { name: 'Hon. Wanjiru Mwangi', color: '#B10DC9' },
  { name: 'Hon. Yusuf Abdi', color: '#01FF70' },
];

export default function MPPoll() {
  const [selectedWard, setSelectedWard] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState('');
  const [votes, setVotes] = useState({});

  const handleVote = () => {
    if (!selectedWard || !selectedCandidate) return;
    const key = `${selectedWard}-${selectedCandidate}`;
    setVotes(prev => ({ ...prev, [key]: (prev[key] || 0) + 1 }));
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

      <select onChange={e => setSelectedCandidate(e.target.value)} value={selectedCandidate}>
        <option value="">Select Candidate</option>
        {candidates.map((c, idx) => (
          <option key={idx} value={c.name}>{c.name}</option>
        ))}
      </select>

      <button onClick={handleVote}>Vote</button>

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
