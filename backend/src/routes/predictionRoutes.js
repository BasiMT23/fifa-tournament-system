import { Router } from 'express';
import { predictionController } from '../controllers/predictionController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// All prediction routes require authentication
router.use(authenticate);

router.post('/', predictionController.submit);
router.get('/mine/:tournamentId', predictionController.mine);
router.get('/:tournamentId/leaderboard', predictionController.leaderboard);

export default router;