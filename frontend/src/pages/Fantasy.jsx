import { useParams } from 'react-router-dom';
import Leaderboard from '../components/Leaderboard';

export default function Fantasy() {
  const { id } = useParams(); // tournamentId

  return (
    <div style={{ padding: '20px' }}>
      <h2>Fantasy Football</h2>
      <p>Build your team and track live points!</p>
      <Leaderboard tournamentId={id} type="fantasy" />
    </div>
  );
}