import { query } from '../config/database.js';

export const tournamentModel = {
  async create({ name, description, format, maxParticipants, startDate, organizerId }) {
    const { rows } = await query(
      `INSERT INTO tournaments
        (name, description, format, max_participants, start_date, organizer_id)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [name, description, format, maxParticipants, startDate, organizerId]
    );
    return rows[0];
  },

  async findAll({ status, format } = {}) {
    let sql = 'SELECT * FROM tournaments WHERE 1=1';
    const params = [];
    if (status) { params.push(status); sql += ` AND status = $${params.length}`; }
    if (format) { params.push(format); sql += ` AND format = $${params.length}`; }
    sql += ' ORDER BY created_at DESC';
    const { rows } = await query(sql, params);
    return rows;
  },

  async findById(id) {
    const { rows } = await query('SELECT * FROM tournaments WHERE id = $1', [id]);
    return rows[0];
  },

  async update(id, fields) {
    // Build dynamic UPDATE — only set provided fields
    const keys = Object.keys(fields);
    const sets = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');
    const { rows } = await query(
      `UPDATE tournaments SET ${sets} WHERE id = $1 RETURNING *`,
      [id, ...keys.map(k => fields[k])]
    );
    return rows[0];
  },

  async delete(id) {
    await query('DELETE FROM tournaments WHERE id = $1', [id]);
  },

  async addParticipant(tournamentId, userId) {
    await query(
      `INSERT INTO tournament_participants (tournament_id, user_id)
       VALUES ($1,$2) ON CONFLICT DO NOTHING`,
      [tournamentId, userId]
    );
  },

  async getParticipants(tournamentId) {
    const { rows } = await query(
      `SELECT tp.*, u.username, u.skill_rating
       FROM tournament_participants tp
       JOIN users u ON u.id = tp.user_id
       WHERE tp.tournament_id = $1 ORDER BY tp.seed NULLS LAST`,
      [tournamentId]
    );
    return rows;
  },
};