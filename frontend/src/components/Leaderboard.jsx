import { useEffect, useState } from 'react';
import api from '../services/api';

export default function Leaderboard({ tournamentId, type = 'predictions' }) {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    const url = type === 'predictions'
      ? `/predictions/${tournamentId}/leaderboard`
      : `/fantasy/${tournamentId}/standings`;
    api.get(url).then(({ data }) => setRows(data));
  }, [tournamentId, type]);

  return (
    <table className="leaderboard">
      <thead>
        <tr><th>#</th><th>Player</th><th>Points</th></tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={r.id || r.team_id}>
            <td>{i + 1}</td>
            <td>{r.username || r.team_name}</td>
            <td>{r.total_points}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}