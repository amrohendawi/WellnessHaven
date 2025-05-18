import { Router } from 'express';
import { login, logout, getCurrentUser, requireAuth } from './auth';

const router = Router();

// Public routes
router.post('/login', login);
router.post('/logout', logout);

// Protected routes
router.get('/me', requireAuth, getCurrentUser);

export default router;
