import { matchModel } from '../models/matchModel.js';
import { scoringService } from '../services/scoringService.js';
import { predictionModel } from '../models/predictionModel.js';
import { emit } from '../sockets/index.js';
import { logger } from '../config/logger.js';

export const matchController = {
  async list(req, res, next) {
    try {
      const matches = await matchModel.findByTournament(req.params.tournamentId);
      res.json(matches);
    } catch (e) { next(e); }
  },

  // Report final score → triggers cascading logic
  async reportScore(req, res, next) {
    try {
      const { scoreA, scoreB } = req.body;
      const match = await matchModel.findById(req.params.id);
      if (!match) return res.status(404).json({ error: 'Match not found' });
      if (match.status === 'completed')
        return res.status(400).json({ error: 'Match already completed' });

      const winnerId = await matchModel.reportScore(match.id, scoreA, scoreB);

      // 1) Score predictions for this match
      await scoringService.scorePredictionsForMatch(match.id, winnerId);

      // 2) Real-time broadcast
      emit('match:completed', { matchId: match.id, scoreA, scoreB, winnerId });
      emit('bracket:update', { tournamentId: match.tournament_id });

      logger.info(`Match ${match.id} reported: ${scoreA}-${scoreB}, winner=${winnerId}`);
      res.json({ message: 'Score reported', winnerId });
    } catch (e) { next(e); }
  },

  async getComments(req, res, next) {
    try { res.json(await matchModel.getComments(req.params.id)); }
    catch (e) { next(e); }
  },

  async postComment(req, res, next) {
    try {
      const c = await matchModel.addComment(
        req.params.id, req.user.sub, req.body.content, req.body.isTrashTalk
      );
      emit('comment:new', { matchId: req.params.id, comment: c });
      res.status(201).json(c);
    } catch (e) { next(e); }
  },
};