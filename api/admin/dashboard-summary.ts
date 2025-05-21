import type { VercelRequest, VercelResponse } from '@vercel/node';
import { config } from 'dotenv';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';
import jwt from 'jsonwebtoken';

// Load environment variables
config();

// Verify JWT token from cookie
async function verifyToken(token: string): Promise<string | null> {
  try {
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    return decoded.userId;
  } catch (error) {
    return null;
  }
}

// We need to set this to make Neon work with serverless
neonConfig.webSocketConstructor = ws;

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

  // Only allow GET for dashboard data
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Auth check
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

  try {
    // Create DB connection
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const db = drizzle(pool);

    // For this serverless function, we'll use simple SQL queries
    // These represent simplified versions of the queries we would normally 
    // run using the full drizzle schema
    
    let totalBookings = 0;
    let confirmed = 0;
    let pending = 0;
    let servicesCount = 0;
    let blockedSlotsCount = 0;
    
    try {
      const [bookingsResult] = await db.execute<{ count: number }>(
        'SELECT COUNT(*) as count FROM bookings'
      );
      totalBookings = Number(bookingsResult?.count) || 0;

      const [confirmedResult] = await db.execute<{ count: number }>(
        "SELECT COUNT(*) as count FROM bookings WHERE status = 'confirmed'"
      );
      confirmed = Number(confirmedResult?.count) || 0;

      const [pendingResult] = await db.execute<{ count: number }>(
        "SELECT COUNT(*) as count FROM bookings WHERE status = 'pending'"
      );
      pending = Number(pendingResult?.count) || 0;
    } catch (e) {
      console.log('Error counting bookings (table may not exist yet):', e);
    }
    
    try {
      const [servicesResult] = await db.execute<{ count: number }>(
        'SELECT COUNT(*) as count FROM services'
      );
      servicesCount = Number(servicesResult?.count) || 0;
    } catch (e) {
      console.log('Error counting services (table may not exist yet):', e);
    }
    
    try {
      const [blockedSlotsResult] = await db.execute<{ count: number }>(
        'SELECT COUNT(*) as count FROM blocked_time_slots'
      );
      blockedSlotsCount = Number(blockedSlotsResult?.count) || 0;
    } catch (e) {
      console.log('Error counting blocked slots (table may not exist yet):', e);
    }

    // Return dashboard summary data
    return res.status(200).json({
      totalBookings,
      confirmed,
      pending,
      servicesCount,
      blockedSlotsCount,
    });
  } catch (error) {
    console.error('Error getting dashboard summary:', error);
    return res.status(500).json({
      message: 'Failed to retrieve dashboard summary. Please try again later.',
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
