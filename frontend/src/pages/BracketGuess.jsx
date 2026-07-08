import { useEffect, useState } from 'react';
import api from '../services/api';
import socket from '../services/socket';

export default function BracketGuess({ tournamentId }) {
  const [matches, setMatches] = useState([]);
  const [myPicks, setMyPicks] = useState({});

  useEffect(() => {
    api.get(`/tournaments/${tournamentId}/matches`).then(({ data }) => setMatches(data));
    api.get(`/predictions/mine/${tournamentId}`).then(({ data }) => {
      const map = {};
      data.forEach(p => { map[`${p.round}-${p.match_number}`] = p.predicted_winner_id; });
      setMyPicks(map);
    });

    socket.emit('join:tournament', tournamentId);
    socket.on('bracket:update', () => {
      api.get(`/tournaments/${tournamentId}/matches`).then(({ data }) => setMatches(data));
    });
    return () => socket.emit('leave:tournament', tournamentId);
  }, [tournamentId]);

  const pick = async (match, winnerId) => {
    if (match.status === 'completed') return alert('Match already completed');
    await api.post('/predictions', {
      tournamentId, round: match.round, matchNumber: match.match_number, predictedWinnerId: winnerId,
    });
    setMyPicks({ ...myPicks, [`${match.round}-${match.match_number}`]: winnerId });
  };

  return (
    <div>
      <h2>Predict the Bracket</h2>
      {matches.map(m => (
        <div key={m.id} style={{ display: 'flex', gap: 8, margin: '8px 0' }}>
          <button
            onClick={() => pick(m, m.participant_a_id)}
            disabled={m.status === 'completed'}
            style={{ background: myPicks[`${m.round}-${m.match_number}`] === m.participant_a_id ? '#0a0' : '#eee' }}>
            {m.a_name || 'TBD'}
          </button>
          <button
            onClick={() => pick(m, m.participant_b_id)}
            disabled={m.status === 'completed'}
            style={{ background: myPicks[`${m.round}-${m.match_number}`] === m.participant_b_id ? '#0a0' : '#eee' }}>
            {m.b_name || 'TBD'}
          </button>
        </div>
      ))}
    </div>
  );
}