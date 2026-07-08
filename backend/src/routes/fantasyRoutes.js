import { Router } from 'express';
import { fantasyController } from '../controllers/fantasyController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate); // Protect all fantasy routes

router.post('/team', fantasyController.createTeam);
router.post('/:tournamentId/players', fantasyController.addPlayer);
router.get('/:tournamentId/roster', fantasyController.roster);
router.get('/:tournamentId/standings', fantasyController.standings);

export default router;