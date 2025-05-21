import type { VercelRequest, VercelResponse } from '@vercel/node';
import cookie from 'cookie';

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

  // Only allow POST for logout
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
