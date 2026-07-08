import { useParams } from 'react-router-dom';
import Bracket from '../components/Bracket';
import Leaderboard from '../components/Leaderboard';

export default function TournamentDetail() {
  const { id } = useParams();

  return (
    <div style={{ padding: '20px' }}>
      <h2>Tournament Details</h2>
      
      <div style={{ display: 'flex', gap: '40px' }}>
        <div style={{ flex: 2 }}>
          <h3>Bracket</h3>
          <Bracket tournamentId={id} />
        </div>
        <div style={{ flex: 1 }}>
          <h3>Prediction Leaderboard</h3>
          <Leaderboard tournamentId={id} type="predictions" />
        </div>
      </div>
    </div>
  );
}