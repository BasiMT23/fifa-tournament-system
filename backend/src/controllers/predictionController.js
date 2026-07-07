import { predictionModel } from '../models/predictionModel.js';
import { matchModel } from '../models/matchModel.js';

export const predictionController = {
  // Users can only submit predictions while a match is "scheduled"
  async submit(req, res, next) {
    try {
      const { tournamentId, round, matchNumber, predictedWinnerId } = req.body;

      const matches = await matchModel.findByTournament(tournamentId);
      const match = matches.find(m => m.round === round && m.match_number === matchNumber);
      if (!match) return res.status(404).json({ error: 'Match slot not found' });
      if (match.status === 'completed')
        return res.status(400).json({ error: 'Cannot predict a completed match' });

      const p = await predictionModel.upsert({
        userId: req.user.sub, tournamentId, round, matchNumber, predictedWinnerId,
      });
      res.status(201).json(p);
    } catch (e) { next(e); }
  },

  // Users can only see THEIR OWN predictions — never expose others'
  async mine(req, res, next) {
    try {
      const preds = await predictionModel.findByUser(req.user.sub, req.params.tournamentId);
      res.json(preds);
    } catch (e) { next(e); }
  },

  async leaderboard(req, res, next) {
    try {
      res.json(await predictionModel.leaderboard(req.params.tournamentId));
    } catch (e) { next(e); }
  },
};