import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = '24h';

// In a real app, this would be stored in a database
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'; // Default password for dev

export interface AuthRequest extends Request {
  userId?: string;
}

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export async function verifyToken(token: string): Promise<string | null> {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    return decoded.userId;
  } catch (error) {
    return null;
  }
}

export async function authenticateUser(username: string, password: string): Promise<boolean> {
  if (username !== ADMIN_USERNAME) return false;
  // For development, compare directly. In production, always use hashed passwords
  if (process.env.NODE_ENV === 'development') {
    return password === ADMIN_PASSWORD;
  }
  // For production, use bcrypt
  return await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH || '');
}

export const requireAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const userId = await verifyToken(token);
  if (!userId) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }

  req.userId = userId;
  next();
};

export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  try {
    const isValid = await authenticateUser(username, password);
    if (!isValid) {
      console.error(`Login failed for user: ${username}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ message: 'An error occurred during authentication' });
  }

  const token = generateToken('admin');

  // Set HTTP-only cookie
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  });

  res.json({ message: 'Login successful' });
};

export const logout = (_req: Request, res: Response) => {
  res.clearCookie('token');
  res.json({ message: 'Logout successful' });
};

export const getCurrentUser = (_req: Request, res: Response) => {
  // In a real app, you might fetch user details from the database
  res.json({
    id: 'admin',
    username: ADMIN_USERNAME,
    role: 'admin',
  });
};
