import { tournamentModel } from '../models/tournamentModel.js';
import { bracketService } from '../services/bracketService.js';

export const tournamentController = {
  async create(req, res, next) {
    try {
      const t = await tournamentModel.create({
        ...req.body,
        organizerId: req.user.role === 'admin' ? null : req.user.sub,
      });
      res.status(201).json(t);
    } catch (e) { next(e); }
  },

  async list(req, res, next) {
    try {
      const items = await tournamentModel.findAll(req.query);
      res.json(items);
    } catch (e) { next(e); }
  },

  async get(req, res, next) {
    try {
      const t = await tournamentModel.findById(req.params.id);
      if (!t) return res.status(404).json({ error: 'Not found' });
      const participants = await tournamentModel.getParticipants(t.id);
      res.json({ ...t, participants });
    } catch (e) { next(e); }
  },

  async update(req, res, next) {
    try {
      const t = await tournamentModel.update(req.params.id, req.body);
      res.json(t);
    } catch (e) { next(e); }
  },

  async remove(req, res, next) {
    try {
      await tournamentModel.delete(req.params.id);
      res.status(204).end();
    } catch (e) { next(e); }
  },

  // Generate bracket from current participants
  async generateBracket(req, res, next) {
    try {
      const t = await tournamentModel.findById(req.params.id);
      if (!t) return res.status(404).json({ error: 'Not found' });
      const participants = await tournamentModel.getParticipants(t.id);
      if (participants.length < 2) return res.status(400).json({ error: 'Need ≥2 participants' });

      const matches = await bracketService.generate(t, participants);
      res.status(201).json({ matches });
    } catch (e) { next(e); }
  },
};