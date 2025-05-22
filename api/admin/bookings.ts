import type { VercelRequest, VercelResponse } from '@vercel/node';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import { pgTable, text, serial, boolean, timestamp } from 'drizzle-orm/pg-core';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import { config } from 'dotenv';
import cookie from 'cookie';

// Load environment variables
config();

// Configure WebSockets for Neon
neonConfig.webSocketConstructor = ws;

// Define schema elements needed for this file
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  isAdmin: boolean('is_admin').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

export const bookings = pgTable('bookings', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  date: text('date').notNull(),
  time: text('time').notNull(),
  service: text('service').notNull(),
  notes: text('notes'),
  status: text('status').default('pending'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Authentication middleware
async function requireAuth(req: VercelRequest): Promise<{ authenticated: boolean; userId?: string }> {
  try {
    // Parse cookies
    const cookieHeader = req.headers.cookie;
    if (!cookieHeader) {
      return { authenticated: false };
    }

    // Extract token from cookies
    const cookies = cookie.parse(cookieHeader);
    const token = cookies.token;
    if (!token) {
      return { authenticated: false };
    }

    // Verify token
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    
    // Initialize database connection
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const db = drizzle({ client: pool });
    
    // Find user in database
    const userResults = await db.select().from(users).where(eq(users.id, parseInt(decoded.userId))).limit(1);
    
    if (!userResults || userResults.length === 0 || !userResults[0].isAdmin) {
      return { authenticated: false };
    }
    
    return { authenticated: true, userId: decoded.userId };
  } catch (error) {
    return { authenticated: false };
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS handling
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Verify authentication
  const auth = await requireAuth(req);
  if (!auth.authenticated) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  // Initialize database connection
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle({ client: pool });

  try {
    if (req.method === 'GET') {
      // Get all bookings
      const allBookings = await db.select().from(bookings);
      return res.status(200).json(allBookings);
    } else if (req.method === 'POST') {
      // Create a new booking
      const { name, email, phone, date, time, service, notes, status } = req.body;
      
      const [newBooking] = await db.insert(bookings).values({
        name,
        email,
        phone,
        date,
        time,
        service,
        notes,
        status: status || 'pending',
        createdAt: new Date(),
      }).returning();
      
      return res.status(201).json(newBooking);
    } else {
      return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error handling bookings request:', error);
    return res.status(500).json({ message: 'An error occurred while processing the request' });
  }
}
