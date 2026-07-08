import { commentModel } from '../models/commentModel.js';
import { emit } from '../sockets/index.js';

export const commentController = {
  async getComments(req, res, next) {
    try {
      const comments = await commentModel.findByMatch(req.params.matchId);
      res.json(comments);
    } catch (e) { next(e); }
  },

  async postComment(req, res, next) {
    try {
      const { content, isTrashTalk } = req.body;
      const comment = await commentModel.create({
        matchId: req.params.matchId,
        userId: req.user.sub,
        content,
        isTrashTalk: isTrashTalk || false
      });
      
      // Emit real-time event to everyone in this match's socket room
      emit('comment:new', { matchId: req.params.matchId, comment }, `match:${req.params.matchId}`);
      
      res.status(201).json(comment);
    } catch (e) { next(e); }
  }
};