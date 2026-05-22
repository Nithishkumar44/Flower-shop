import { Router } from 'express';
import { register, login, googleLogin, getMe, forgotPassword } from '../controllers/auth.controller';
import { validate } from '../middleware/validation';
import { registerSchema, loginSchema, forgotPasswordSchema } from '../validators/auth.validator';
import { protect } from '../middleware/auth';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/google-login', googleLogin);
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);
router.get('/me', protect, getMe);

export default router;
