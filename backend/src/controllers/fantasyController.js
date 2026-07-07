import { fantasyModel } from '../models/fantasyModel.js';

export const fantasyController = {
  async createTeam(req, res, next) {
    try {
      const existing = await fantasyModel.getTeam(req.user.sub, req.body.tournamentId);
      if (existing) return res.status(400).json({ error: 'Team already exists' });
      const team = await fantasyModel.createTeam({
        userId: req.user.sub,
        tournamentId: req.body.tournamentId,
        teamName: req.body.teamName,
      });
      res.status(201).json(team);
    } catch (e) { next(e); }
  },

  async addPlayer(req, res, next) {
    try {
      const team = await fantasyModel.getTeam(req.user.sub, req.params.tournamentId);
      if (!team) return res.status(404).json({ error: 'Create a team first' });
      await fantasyModel.addPlayer(team.id, req.body.playerId, req.body.isCaptain);
      res.status(204).end();
    } catch (e) { next(e); }
  },

  async roster(req, res, next) {
    try {
      const team = await fantasyModel.getTeam(req.user.sub, req.params.tournamentId);
      if (!team) return res.json({ team: null, roster: [] });
      const roster = await fantasyModel.myRoster(team.id);
      res.json({ team, roster });
    } catch (e) { next(e); }
  },

  async standings(req, res, next) {
    try { res.json(await fantasyModel.standings(req.params.tournamentId)); }
    catch (e) { next(e); }
  },
};