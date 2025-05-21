import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';
import { config } from 'dotenv';
import cookie from 'cookie';

// Load environment variables
config();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS handling
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Extract the path from the URL
  const path = req.url?.split('/api/auth/')[1]?.split('?')[0] || '';

  // Route to appropriate handler based on path
  if (path === 'login') {
    return handleLogin(req, res);
  } else if (path === 'logout') {
    return handleLogout(req, res);
  } else if (path === 'me') {
    return handleMe(req, res);
  } else {
    return res.status(404).json({ message: 'Endpoint not found' });
  }
}

// Login handler
async function handleLogin(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    // Authentication logic 
    const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
    const JWT_EXPIRES_IN = '24h';
    
    let isValid = false;
    
    if (username !== ADMIN_USERNAME) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // For dev/production password check
    isValid = password === ADMIN_PASSWORD;

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

// Logout handler
function handleLogout(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Clear the token cookie
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge: 0, // Immediately expire the cookie
    path: '/',
  };

  res.setHeader('Set-Cookie', cookie.serialize('token', '', cookieOptions));
  return res.status(200).json({ message: 'Logout successful' });
}

// Me handler
async function handleMe(req: VercelRequest, res: VercelResponse) {
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
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
    const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      
      // Return user info
      return res.status(200).json({
        id: 'admin',
        username: ADMIN_USERNAME,
        firstName: 'Admin',
        role: 'admin',
      });
    } catch (error) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ message: 'An error occurred during authentication' });
  }
}
