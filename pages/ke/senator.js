import { useState } from 'react';
import { wards } from '../../components/WardSelector';

const candidates = [
  { name: 'Hon. Jacob Otieno', color: '#3D9970', party: 'KANU', symbol: '🌿' },
  { name: 'Hon. Alice Kiprono', color: '#FF851B', party: 'UDA', symbol: '🌻' },
  { name: 'Hon. Kevin Mwangangi', color: '#B10DC9', party: 'ODM', symbol: '🟠' },
];

export default function SenatorPoll() {
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
      <h2>🇰🇪 Kenya - Senator Voting</h2>

      <select onChange={e => setSelectedWard(e.target.value)} value={selectedWard}>
        <option value="">Select Ward</option>
        {wards.map((w, idx) => (
          <option key={idx} value={w.name}>{w.name}</option>
        ))}
      </select>

      <h4 style={{ marginTop: '20px' }}>Choose Your Candidate:</h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', margin: '15px 0' }}>
        {candidates.map((c) => (
          <div
            key={c.name}
            style={{
              backgroundColor: '#fdfdfd',
              border: `2px solid ${c.color}`,
              borderRadius: '8px',
              padding: '12px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div>
              <strong style={{ fontSize: '16px' }}>{c.name}</strong><br />
              <span style={{ fontSize: '14px', color: '#666' }}>{c.party}</span>
            </div>
            <div style={{ fontSize: '24px' }}>{c.symbol}</div>
            <button
              onClick={() => handleVote(c.name)}
              style={{
                backgroundColor: c.color,
                color: '#fff',
                border: 'none',
                borderRadius: '5px',
                padding: '6px 12px',
                cursor: 'pointer'
              }}
            >
              Vote
            </button>
          </div>
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
