import { useEffect, useState } from 'react';
import api from '../services/api';

export default function Bracket({ tournamentId }) {
  const [tree, setTree] = useState({ rounds: [] });

  useEffect(() => {
    api.get(`/tournaments/${tournamentId}/matches`).then(({ data }) => {
      const byRound = {};
      data.forEach(m => { (byRound[m.round] ||= []).push(m); });
      const rounds = Object.values(byRound);
      setTree({ rounds });
    });
  }, [tournamentId]);

  return (
    <div className="bracket" style={{ display: 'flex', gap: 40, overflowX: 'auto' }}>
      {tree.rounds.map((matches, rIdx) => (
        <div className="round" key={rIdx} style={{ display: 'flex', flexDirection: 'column', gap: 20, justifyContent: 'space-around' }}>
          <h4>Round {rIdx + 1}</h4>
          {matches.map(m => (
            <div key={m.id} className="match-card"
                 style={{ border: '1px solid #ccc', padding: 10, minWidth: 180, borderRadius: 6 }}>
              <div style={{ fontWeight: m.winner_id === m.participant_a_id ? 'bold' : 'normal' }}>
                {m.a_name || 'TBD'} <span>{m.score_a ?? '-'}</span>
              </div>
              <div style={{ fontWeight: m.winner_id === m.participant_b_id ? 'bold' : 'normal' }}>
                {m.b_name || 'TBD'} <span>{m.score_b ?? '-'}</span>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}