import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db } from './db';
import { users } from '../shared/schema';
import { eq } from 'drizzle-orm';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = '24h';

// No longer using environment variables for admin credentials

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
  try {
    // Find the user in the database
    const user = await db.select().from(users).where(eq(users.username, username)).limit(1);
    
    if (!user || user.length === 0 || !user[0].isAdmin) {
      return false;
    }
    
    // Compare the provided password with the stored hash
    return await bcrypt.compare(password, user[0].password);
  } catch (error) {
    console.error('Authentication error:', error);
    return false;
  }
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

export const getCurrentUser = async (req: AuthRequest, res: Response) => {
  try {
    // Fetch user details from the database
    const adminUsers = await db.select({
      id: users.id,
      username: users.username,
      isAdmin: users.isAdmin
    }).from(users).where(eq(users.isAdmin, true)).limit(1);
    
    if (!adminUsers || adminUsers.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      id: adminUsers[0].id.toString(),
      username: adminUsers[0].username,
      role: 'admin',
    });
  } catch (error) {
    console.error('Error fetching current user:', error);
    res.status(500).json({ message: 'Error fetching user details' });
  }
};
