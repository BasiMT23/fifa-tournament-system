import { Router } from 'express';
import { authController } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import Joi from 'joi';

const router = Router();

const registerSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).pattern(/[A-Z]/).pattern(/[0-9]/).required()
    .messages({ 'string.pattern': 'Password must include an uppercase letter and a number' }),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

router.post('/register', validateBody(registerSchema), authController.register);
router.post('/login',    validateBody(loginSchema),    authController.login);
router.post('/refresh',  authController.refresh);
router.get ('/me',       authenticate, authController.me);
router.post('/logout',   authenticate, authController.logout);

export default router;