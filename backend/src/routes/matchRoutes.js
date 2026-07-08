import { Router } from 'express';
import { matchController } from '../controllers/matchController.js';
import { commentController } from '../controllers/commentController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

// Matches
router.get('/:tournamentId/matches', matchController.list);
router.post('/:id/score', authenticate, authorize('admin', 'organizer'), matchController.reportScore);

// Comments for a specific match
router.get('/:matchId/comments', commentController.getComments);
router.post('/:matchId/comments', authenticate, commentController.postComment);

export default router;