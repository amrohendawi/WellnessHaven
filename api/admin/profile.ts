import type { VercelRequest, VercelResponse } from '@vercel/node';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import { pgTable, text, serial, boolean, timestamp } from 'drizzle-orm/pg-core';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import { config } from 'dotenv';
import cookie from 'cookie';
import bcrypt from 'bcryptjs';

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
    
    if (!userResults || userResults.length === 0) {
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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
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
      // Get the admin user profile
      const userResults = await db.select({
        id: users.id,
        username: users.username,
        isAdmin: users.isAdmin,
        createdAt: users.createdAt
      }).from(users).where(eq(users.id, parseInt(auth.userId!))).limit(1);
      
      if (!userResults || userResults.length === 0) {
        return res.status(404).json({ message: 'Profile not found' });
      }
      
      // Return just the username and other public fields
      return res.status(200).json({
        id: userResults[0].id.toString(),
        username: userResults[0].username,
        firstName: 'Admin', // Default until we add these fields to the schema
        email: userResults[0].username,
        imageUrl: ''
      });
    } else if (req.method === 'POST' && req.url?.includes('/update')) {
      // Handle profile update
      const { username, firstName, email, password } = req.body;
      
      // Prepare update data
      const updateData: Record<string, any> = {};
      
      if (username) {
        updateData.username = username;
      }
      
      if (password) {
        updateData.password = await bcrypt.hash(password, 10);
      }
      
      // Update the user if there are changes
      if (Object.keys(updateData).length > 0) {
        await db.update(users)
          .set(updateData)
          .where(eq(users.id, parseInt(auth.userId!)));
      }
      
      // Return updated profile data
      const updatedUser = await db.select({
        id: users.id,
        username: users.username,
        isAdmin: users.isAdmin,
      }).from(users).where(eq(users.id, parseInt(auth.userId!))).limit(1);
      
      return res.status(200).json({
        id: updatedUser[0].id.toString(),
        username: updatedUser[0].username,
        firstName: firstName || 'Admin',
        email: email || updatedUser[0].username,
        imageUrl: ''
      });
    } else {
      return res.status(404).json({ message: 'Endpoint not found' });
    }
  } catch (error) {
    console.error('Error handling profile request:', error);
    return res.status(500).json({ message: 'An error occurred while processing the request' });
  }
}
