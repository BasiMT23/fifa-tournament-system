import { predictionModel } from '../models/predictionModel.js';
import { matchModel } from '../models/matchModel.js';
import { query } from '../config/database.js';

// Round weights — doubles each round
const ROUND_WEIGHTS = { 1: 1, 2: 2, 3: 4, 4: 8, 5: 16 };

export const scoringService = {
  /**
   * When a match completes, score all predictions for it.
   */
  async scorePredictionsForMatch(matchId, actualWinnerId) {
    const match = await matchModel.findById(matchId);
    if (!match) return;

    const predictions = await predictionModel.findByMatch(
      match.tournament_id, match.round, match.match_number
    );

    const weight = ROUND_WEIGHTS[match.round] || 1;
    for (const p of predictions) {
      if (p.predicted_winner_id === actualWinnerId) {
        // Upset bonus: lower seed (higher seed number) won
        let bonus = 0;
        const winner = await query('SELECT seed FROM tournament_participants WHERE tournament_id=$1 AND user_id=$2',
          [match.tournament_id, actualWinnerId]);
        if (winner.rows[0]?.seed && winner.rows[0].seed > 8) bonus = 1;

        await predictionModel.awardPoints(p.id, weight + bonus);
      }
    }
  },

  // ====== FANTASY ======
  /**
   * Convert real-world match performance → fantasy points.
   * Standard FPL-style scoring.
   */
  calculateFantasyPoints(stats) {
    let pts = 0;
    const { position, goals, assists, minutesPlayed, cleanSheet, yellowCards, redCards } = stats;
    pts += goals   * (position === 'GK' ? 10 : position === 'DEF' ? 6 : position === 'MID' ? 5 : 4);
    pts += assists * 3;
    if (minutesPlayed >= 60) pts += 2; else if (minutesPlayed > 0) pts += 1;
    if (cleanSheet && ['GK','DEF'].includes(position)) pts += 4;
    if (cleanSheet && position === 'MID') pts += 1;
    pts -= yellowCards * 1;
    pts -= redCards * 3;
    return pts;
  },

  async applyFantasyScoring(fantasyPlayerId, gameweek, matchExternalId, stats) {
    const points = this.calculateFantasyPoints(stats);
    const breakdown = { ...stats, points };

    await query(
      `INSERT INTO fantasy_scoring (fantasy_player_id, match_external_id, gameweek, points, breakdown)
       VALUES ($1,$2,$3,$4,$5)`,
      [fantasyPlayerId, matchExternalId, gameweek, points, breakdown]
    );

    // Captain doubles points for their team
    const { rows: teams } = await query(
      `SELECT ft.id, ft.is_captain FROM fantasy_team_players ftp
       JOIN fantasy_teams ft ON ft.id = ftp.fantasy_team_id
       WHERE ftp.fantasy_player_id = $1`,
      [fantasyPlayerId]
    );
    for (const t of teams) {
      const earned = t.is_captain ? points * 2 : points;
      await query(
        'UPDATE fantasy_teams SET total_points = total_points + $2, week_points = week_points + $2 WHERE id = $1',
        [t.id, earned]
      );
    }
  },

  // Weekly reset: zero out week_points
  async weeklyReset() {
    await query('UPDATE fantasy_teams SET week_points = 0');
  },
};