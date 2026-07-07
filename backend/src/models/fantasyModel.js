import { query } from '../config/database.js';

export const fantasyModel = {
  async createTeam({ userId, tournamentId, teamName }) {
    const { rows } = await query(
      `INSERT INTO fantasy_teams (user_id, tournament_id, team_name)
       VALUES ($1,$2,$3) RETURNING *`,
      [userId, tournamentId, teamName]
    );
    return rows[0];
  },

  async getTeam(userId, tournamentId) {
    const { rows } = await query(
      'SELECT * FROM fantasy_teams WHERE user_id=$1 AND tournament_id=$2',
      [userId, tournamentId]
    );
    return rows[0];
  },

  async addPlayer(teamId, playerId, isCaptain = false) {
    await query(
      `INSERT INTO fantasy_team_players (fantasy_team_id, fantasy_player_id, is_captain)
       VALUES ($1,$2,$3) ON CONFLICT DO NOTHING`,
      [teamId, playerId, isCaptain]
    );
    if (isCaptain) {
      // Only one captain per team
      await query(
        'UPDATE fantasy_team_players SET is_captain=false WHERE fantasy_team_id=$1 AND fantasy_player_id!=$2',
        [teamId, playerId]
      );
    }
  },

  async removePlayer(teamId, playerId) {
    await query(
      'DELETE FROM fantasy_team_players WHERE fantasy_team_id=$1 AND fantasy_player_id=$2',
      [teamId, playerId]
    );
  },

  async myRoster(teamId) {
    const { rows } = await query(
      `SELECT fp.*, ftp.is_captain FROM fantasy_team_players ftp
       JOIN fantasy_players fp ON fp.id = ftp.fantasy_player_id
       WHERE ftp.fantasy_team_id=$1`,
      [teamId]
    );
    return rows;
  },

  async standings(tournamentId) {
    const { rows } = await query(
      `SELECT ft.id, ft.team_name, u.username, ft.total_points, ft.week_points
       FROM fantasy_teams ft JOIN users u ON u.id = ft.user_id
       WHERE ft.tournament_id=$1
       ORDER BY ft.total_points DESC`,
      [tournamentId]
    );
    return rows;
  },

  async upsertExternalPlayer(p) {
    const { rows } = await query(
      `INSERT INTO fantasy_players (external_id, name, position, team, rating, price, photo_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       ON CONFLICT (external_id)
       DO UPDATE SET rating=EXCLUDED.rating, price=EXCLUDED.price
       RETURNING id`,
      [p.externalId, p.name, p.position, p.team, p.rating, p.price, p.photoUrl]
    );
    return rows[0].id;
  },
};