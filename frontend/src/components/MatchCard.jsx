export default function MatchCard({ match }) {
  return (
    <div style={{ border: '1px solid #ccc', padding: '10px', margin: '5px', borderRadius: '5px' }}>
      <div style={{ fontWeight: match.winner_id === match.participant_a_id ? 'bold' : 'normal' }}>
        {match.a_name || 'TBD'} <span style={{ float: 'right' }}>{match.score_a ?? '-'}</span>
      </div>
      <div style={{ fontWeight: match.winner_id === match.participant_b_id ? 'bold' : 'normal' }}>
        {match.b_name || 'TBD'} <span style={{ float: 'right' }}>{match.score_b ?? '-'}</span>
      </div>
    </div>
  );
}