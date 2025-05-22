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

// Define blocked time slots table based on existing structure in the database
export const blockedTimeSlots = pgTable('blocked_time_slots', {
  id: serial('id').primaryKey(),
  date: text('date').notNull(),
  time: text('time').notNull(),
  created_at: timestamp('created_at').defaultNow(),
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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
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
    // Log the connection string (with sensitive info redacted)
    console.log('Using database connection with hostname:', process.env.DATABASE_URL?.split('@')[1]?.split('/')[0] || 'unknown');
    
    if (req.method === 'GET') {
      try {
        console.log('Attempting to fetch blocked time slots from database');
        const slots = await db.select().from(blockedTimeSlots);
        console.log(`Successfully retrieved ${slots.length} blocked time slots`);
        return res.status(200).json(slots);
      } catch (dbError) {
        console.error('Database error when fetching blocked time slots:', dbError);
        return res.status(500).json({ message: 'Database error when fetching blocked slots', error: dbError.message });
      }
    } else if (req.method === 'POST') {
      try {
        // Create a new blocked slot
        const { date, time } = req.body;
        console.log('Creating new blocked time slot with data:', { date, time });
        
        if (!date || !time) {
          return res.status(400).json({ message: 'Date and time are required' });
        }
        
        // Use created_at field name instead of createdAt to match the schema
        const [newSlot] = await db.insert(blockedTimeSlots).values({
          date,
          time,
          created_at: new Date(),
        }).returning();
        
        console.log('Successfully created new blocked time slot with ID:', newSlot.id);
        return res.status(201).json(newSlot);
      } catch (dbError) {
        console.error('Database error when creating blocked time slot:', dbError);
        return res.status(500).json({ message: 'Database error when creating blocked slot', error: dbError.message });
      }
    } else if (req.method === 'DELETE') {
      try {
        // Delete a blocked slot
        const id = parseInt(req.query.id as string);
        console.log('Attempting to delete blocked time slot with ID:', id);
        
        if (isNaN(id)) {
          return res.status(400).json({ message: 'Valid ID is required' });
        }
        
        await db.delete(blockedTimeSlots).where(eq(blockedTimeSlots.id, id));
        console.log('Successfully deleted blocked time slot with ID:', id);
        return res.status(204).end();
      } catch (dbError) {
        console.error('Database error when deleting blocked time slot:', dbError);
        return res.status(500).json({ message: 'Database error when deleting blocked slot', error: dbError.message });
      }
    } else {
      return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Unexpected error handling blocked slots request:', error);
    return res.status(500).json({ message: 'An unexpected error occurred while processing the request', error: error.message });
  }
}
