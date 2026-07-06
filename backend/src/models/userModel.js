import { query } from '../config/database.js';
import bcrypt from 'bcryptjs';

export const userModel = {
  async create({ username, email, password, role = 'player' }) {
    const salt = await bcrypt.genSalt(12);    // 12 rounds = ~250ms — strong but not slow
    const passwordHash = await bcrypt.hash(password, salt);
    const { rows } = await query(
      `INSERT INTO users (username, email, password_hash, role)
       VALUES ($1,$2,$3,$4) RETURNING id, username, email, role, created_at`,
      [username, email, passwordHash, role]
    );
    return rows[0];
  },

  async findByEmail(email) {
    const { rows } = await query('SELECT * FROM users WHERE email = $1', [email]);
    return rows[0];
  },

  async findById(id) {
    const { rows } = await query(
      'SELECT id, username, email, role, avatar_url, skill_rating FROM users WHERE id = $1',
      [id]
    );
    return rows[0];
  },

  async verifyPassword(plain, hash) {
    return bcrypt.compare(plain, hash);
  },

  async updateAvatar(userId, url) {
    await query('UPDATE users SET avatar_url = $1 WHERE id = $2', [url, userId]);
  },
};