import { query } from '../config/database.js';

export const matchModel = {
  async findById(id) {
    const { rows } = await query('SELECT * FROM matches WHERE id = $1', [id]);
    return rows[0];
  },

  async findByTournament(tournamentId) {
    const { rows } = await query(
      `SELECT m.*, ua.username AS a_name, ub.username AS b_name, uw.username AS winner_name
       FROM matches m
       LEFT JOIN users ua ON ua.id = m.participant_a_id
       LEFT JOIN users ub ON ub.id = m.participant_b_id
       LEFT JOIN users uw ON uw.id = m.winner_id
       WHERE m.tournament_id = $1 ORDER BY m.round, m.match_number`,
      [tournamentId]
    );
    return rows;
  },

  async reportScore(id, scoreA, scoreB) {
    const match = await this.findById(id);
    if (!match) throw new Error('Match not found');
    const winnerId = scoreA > scoreB ? match.participant_a_id
                  : scoreB > scoreA ? match.participant_b_id
                  : null; // tie — handle with penalties if needed
    await query(
      `UPDATE matches SET score_a=$1, score_b=$2, winner_id=$3, status='completed', completed_at=NOW()
       WHERE id=$4`,
      [scoreA, scoreB, winnerId, id]
    );

    // Advance winner to next match
    if (winnerId && match.next_match_id) {
      const next = await this.findById(match.next_match_id);
      // Determine if winner goes in slot A or B based on match_number parity
      const slot = match.match_number % 2 === 1 ? 'participant_a_id' : 'participant_b_id';
      await query(`UPDATE matches SET ${slot}=$1 WHERE id=$2`, [winnerId, match.next_match_id]);
    }
    return winnerId;
  },

  async getComments(matchId) {
    const { rows } = await query(
      `SELECT c.*, u.username, u.avatar_url FROM match_comments c
       JOIN users u ON u.id = c.user_id
       WHERE c.match_id=$1 ORDER BY c.created_at ASC`,
      [matchId]
    );
    return rows;
  },

  async addComment(matchId, userId, content, isTrashTalk = false) {
    const { rows } = await query(
      `INSERT INTO match_comments (match_id, user_id, content, is_trash_talk)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [matchId, userId, content, isTrashTalk]
    );
    return rows[0];
  },
};