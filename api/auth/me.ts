import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';
import { config } from 'dotenv';

// Load environment variables
config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';

// Verify JWT token from cookie
async function verifyToken(token: string): Promise<string | null> {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    return decoded.userId;
  } catch (error) {
    return null;
  }
}

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
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow GET for user info
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Parse cookies
    const cookieHeader = req.headers.cookie;
    if (!cookieHeader) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Extract token from cookies
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);

    const token = cookies.token;
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Verify token
    const userId = await verifyToken(token);
    if (!userId) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    // Return user info
    // In a real app, you might fetch user details from the database
    return res.status(200).json({
      id: 'admin',
      username: ADMIN_USERNAME,
      firstName: 'Admin',
      role: 'admin',
    });
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ message: 'An error occurred during authentication' });
  }
}
