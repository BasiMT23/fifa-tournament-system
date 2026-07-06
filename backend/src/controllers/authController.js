import { userModel } from '../models/userModel.js';
import { signAccess, signRefresh, verifyRefresh } from '../utils/jwt.js';
import { logger } from '../config/logger.js';

// In production, store refresh tokens in Redis with a TTL so they can be revoked.
// For brevity here, we keep an in-memory store keyed by user id.
const refreshStore = new Map();

export const authController = {
  async register(req, res, next) {
    try {
      const { username, email, password } = req.body;
      const existing = await userModel.findByEmail(email);
      if (existing) return res.status(409).json({ error: 'Email already registered' });

      const user = await userModel.create({ username, email, password });
      logger.info(`New user registered: ${user.email}`);

      const access = signAccess({ sub: user.id, role: user.role });
      const refresh = signRefresh({ sub: user.id });
      refreshStore.set(user.id, refresh);

      res.status(201).json({ user: { id: user.id, username, email, role: user.role }, access, refresh });
    } catch (err) { next(err); }
  },

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const user = await userModel.findByEmail(email);
      if (!user) return res.status(401).json({ error: 'Invalid credentials' });

      const ok = await userModel.verifyPassword(password, user.password_hash);
      if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

      const access = signAccess({ sub: user.id, role: user.role });
      const refresh = signRefresh({ sub: user.id });
      refreshStore.set(user.id, refresh);

      logger.info(`User logged in: ${user.email}`);
      res.json({
        user: { id: user.id, username: user.username, email, role: user.role },
        access,
        refresh,
      });
    } catch (err) { next(err); }
  },

  async refresh(req, res, next) {
    try {
      const { refresh: token } = req.body;
      if (!token) return res.status(400).json({ error: 'Refresh token required' });

      const payload = verifyRefresh(token);
      const stored = refreshStore.get(payload.sub);
      if (stored !== token) return res.status(401).json({ error: 'Invalid refresh token' });

      const user = await userModel.findById(payload.sub);
      const access = signAccess({ sub: user.id, role: user.role });
      res.json({ access });
    } catch (err) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }
  },

  async me(req, res) {
    const user = await userModel.findById(req.user.sub);
    res.json({ user });
  },

  async logout(req, res) {
    refreshStore.delete(req.user.sub);
    res.json({ message: 'Logged out' });
  },
};