import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { config } from 'dotenv';
import cookie from 'cookie';

// Load environment variables
config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = '24h';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS handling
  const origin = req.headers.origin;
  const allowedOrigins = [
    'https://dubai-rose.vercel.app',
    'https://dubai-rose-spa.vercel.app',
    'http://localhost:3000',
    'http://localhost:5173',
  ];
  
  // Allow Vercel preview URLs
  const isVercelPreview = origin && origin.endsWith('vercel.app');
  
  if (origin && (allowedOrigins.includes(origin) || isVercelPreview)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST for login
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    // Authentication logic
    let isValid = false;
    
    if (username !== ADMIN_USERNAME) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // For development, compare directly. In production, use hashed password if available
    if (process.env.NODE_ENV === 'development' || !process.env.ADMIN_PASSWORD_HASH) {
      isValid = password === ADMIN_PASSWORD;
    } else {
      // For production with password hash
      isValid = await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH);
    }

    if (!isValid) {
      console.error(`Login failed for user: ${username}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign({ userId: 'admin' }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    // Set HTTP-only cookie
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      path: '/',
    };

    res.setHeader('Set-Cookie', cookie.serialize('token', token, cookieOptions));
    return res.status(200).json({ message: 'Login successful' });
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ message: 'An error occurred during authentication' });
  }
}
