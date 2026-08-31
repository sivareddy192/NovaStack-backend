import express from 'express';
import { login, register, getMe, logout } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/login', authLimiter, login);
router.post('/register', authLimiter, register);
router.get('/me', protect, getMe);
router.post('/logout', logout);

export default router;
