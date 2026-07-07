import { query } from '../config/database.js';

export const predictionModel = {
  // Upsert: one prediction per (user, tournament, round, match_number)
  async upsert({ userId, tournamentId, round, matchNumber, predictedWinnerId }) {
    const { rows } = await query(
      `INSERT INTO predictions (user_id, tournament_id, round, match_number, predicted_winner_id)
       VALUES ($1,$2,$3,$4,$5)
       ON CONFLICT (user_id, tournament_id, round, match_number)
       DO UPDATE SET predicted_winner_id = EXCLUDED.predicted_winner_id
       RETURNING *`,
      [userId, tournamentId, round, matchNumber, predictedWinnerId]
    );
    return rows[0];
  },

  async findByUser(userId, tournamentId) {
    const { rows } = await query(
      'SELECT * FROM predictions WHERE user_id=$1 AND tournament_id=$2',
      [userId, tournamentId]
    );
    return rows;
  },

  async findByMatch(tournamentId, round, matchNumber) {
    const { rows } = await query(
      `SELECT p.*, u.username FROM predictions p
       JOIN users u ON u.id = p.user_id
       WHERE p.tournament_id=$1 AND p.round=$2 AND p.match_number=$3`,
      [tournamentId, round, matchNumber]
    );
    return rows;
  },

  async awardPoints(predictionId, points) {
    await query('UPDATE predictions SET points_earned=$2 WHERE id=$1', [predictionId, points]);
  },

  async leaderboard(tournamentId) {
    const { rows } = await query(
      `SELECT u.id, u.username, u.avatar_url, COALESCE(SUM(p.points_earned),0) AS total_points
       FROM users u
       LEFT JOIN predictions p ON p.user_id = u.id AND p.tournament_id = $1
       WHERE u.id IN (SELECT user_id FROM predictions WHERE tournament_id=$1)
       GROUP BY u.id, u.username, u.avatar_url
       ORDER BY total_points DESC`,
      [tournamentId]
    );
    return rows;
  },
};