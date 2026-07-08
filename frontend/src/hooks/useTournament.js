import { useEffect, useState } from 'react';
import api from '../services/api';

export function useTournament(id) {
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.get(`/tournaments/${id}`)
      .then(({ data }) => setTournament(data))
      .finally(() => setLoading(false));
  }, [id]);

  return { tournament, loading };
}