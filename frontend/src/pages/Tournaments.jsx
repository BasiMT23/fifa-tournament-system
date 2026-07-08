import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function Tournaments() {
  const [tournaments, setTournaments] = useState([]);

  useEffect(() => {
    api.get('/tournaments').then(({ data }) => setTournaments(data));
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h2>Tournaments</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
        {tournaments.map(t => (
          <div key={t.id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', width: '250px' }}>
            <h3>{t.name}</h3>
            <p>Format: {t.format}</p>
            <p>Status: {t.status}</p>
            <Link to={`/tournaments/${t.id}`} style={{ color: 'blue' }}>View Details</Link>
          </div>
        ))}
      </div>
    </div>
  );
}