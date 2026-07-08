import { query } from '../config/database.js';

export const commentModel = {
  async findByMatch(matchId) {
    const { rows } = await query(
      `SELECT c.*, u.username, u.avatar_url 
       FROM match_comments c
       JOIN users u ON u.id = c.user_id
       WHERE c.match_id = $1 
       ORDER BY c.created_at ASC`,
      [matchId]
    );
    return rows;
  },

  async create({ matchId, userId, content, isTrashTalk }) {
    const { rows } = await query(
      `INSERT INTO match_comments (match_id, user_id, content, is_trash_talk)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [matchId, userId, content, isTrashTalk]
    );
    return rows[0];
  }
};