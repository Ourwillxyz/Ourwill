import { useState } from 'react';
import { wards } from '../../components/wardselector';

const candidates = [
  { name: 'Amina Mwangi', ward: 'Likoni Ward' },
  { name: 'John Otieno', ward: 'Timbwani Ward' },
  { name: 'Grace Wanjiru', ward: 'Langata Ward' },
];

export default function MCAPoll() {
  const [selectedWard, setSelectedWard] = useState('');
  const [voted, setVoted] = useState(false);

  const filtered = candidates.filter(c => c.ward === selectedWard);

  return (
    <div style={{ padding: '20px' }}>
      <h2>🇰🇪 Kenya - MCA Voting</h2>
      <label>Select your Ward:</label><br />
      <select onChange={(e) => setSelectedWard(e.target.value)} value={selectedWard}>
        <option value="">-- Choose a Ward --</option>
        {wards.map((ward, i) => (
          <option key={i} value={ward.name}>{ward.name}</option>
        ))}
      </select>

      {selectedWard && (
        <div style={{ marginTop: '20px' }}>
          <h3>Candidates in {selectedWard}</h3>
          {filtered.map((candidate, i) => (
            <div key={i}>
              <p>{candidate.name}</p>
              <button onClick={() => setVoted(true)} disabled={voted}>
                {voted ? 'Voted' : 'Vote'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
