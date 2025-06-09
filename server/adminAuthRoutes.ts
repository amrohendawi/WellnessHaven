import { Router } from 'express';
import { getCurrentUser, login, logout, requireAuth } from './auth';

const router = Router();

// Public routes
router.post('/login', login);
router.post('/logout', logout);

// Protected routes
router.get('/me', requireAuth, getCurrentUser);

export default router;
