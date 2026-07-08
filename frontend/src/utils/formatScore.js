/**
 * Formats match data into a readable score string.
 * Example output: "PlayerA 2 - 1 PlayerB" or "TBD vs TBD"
 */
export const formatScore = (match) => {
  if (!match) return 'No match data';

  const scoreA = match.score_a !== null ? match.score_a : '-';
  const scoreB = match.score_b !== null ? match.score_b : '-';
  const nameA = match.a_name || 'TBD';
  const nameB = match.b_name || 'TBD';

  // If the match hasn't started, don't show 0-0, show "vs"
  if (match.status === 'scheduled') {
    return `${nameA} vs ${nameB}`;
  }

  return `${nameA} ${scoreA} - ${scoreB} ${nameB}`;
};

/**
 * Returns a CSS color based on match status for UI styling
 */
export const getStatusColor = (status) => {
  switch (status) {
    case 'live':
      return '#ff4d4d';   // Red
    case 'completed':
      return '#28a745';   // Green
    case 'walkover':
      return '#6c757d';   // Gray
    default:
      return '#000000';   // Black (scheduled)
  }
};