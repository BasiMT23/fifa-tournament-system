import { Router } from 'express';
import { tournamentController } from '../controllers/tournamentController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import Joi from 'joi';

const router = Router();

const tournamentSchema = Joi.object({
  name: Joi.string().min(3).max(150).required(),
  description: Joi.string().max(2000).allow(''),
  format: Joi.string().valid('knockout','round_robin','group_knockout').required(),
  maxParticipants: Joi.number().integer().min(2).max(64).required(),
  startDate: Joi.date().iso(),
});

router.get   ('/',         tournamentController.list);
router.get   ('/:id',      tournamentController.get);
router.post  ('/',         authenticate, authorize('admin','organizer'),
                            validateBody(tournamentSchema), tournamentController.create);
router.put   ('/:id',      authenticate, authorize('admin','organizer'), tournamentController.update);
router.delete('/:id',      authenticate, authorize('admin','organizer'), tournamentController.remove);
router.post  ('/:id/bracket', authenticate, authorize('admin','organizer'),
                            tournamentController.generateBracket);

export default router;