import type { VercelRequest, VercelResponse } from '@vercel/node';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import { pgTable, text, serial, boolean, timestamp } from 'drizzle-orm/pg-core';
import { eq, ne } from 'drizzle-orm';
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
      // Get all users
      const allUsers = await db.select({
        id: users.id,
        username: users.username,
        isAdmin: users.isAdmin,
        createdAt: users.createdAt
      }).from(users);
      
      // Format the users with additional fields for compatibility with the frontend
      const formattedUsers = allUsers.map(user => ({
        ...user,
        id: user.id.toString(),
        firstName: '', // Placeholder
        email: user.username,
        imageUrl: '',
      }));
      
      return res.status(200).json(formattedUsers);
    } else if (req.method === 'POST' && req.url?.includes('/create')) {
      // Create a new user
      const { username, firstName, email, password, isAdmin } = req.body;
      
      // Validate required fields
      if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
      }
      
      // Check if username already exists
      const existingUser = await db.select().from(users).where(eq(users.username, username)).limit(1);
      
      if (existingUser && existingUser.length > 0) {
        return res.status(400).json({ message: 'Username already exists' });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create new user
      const [newUser] = await db.insert(users).values({
        username,
        password: hashedPassword,
        isAdmin: isAdmin === 'true' || isAdmin === true,
        createdAt: new Date(),
      }).returning();
      
      return res.status(201).json({ 
        id: newUser.id.toString(),
        username: newUser.username,
        isAdmin: newUser.isAdmin,
        firstName: firstName || '',
        email: email || newUser.username,
        imageUrl: '',
      });
    } else if (req.method === 'POST' && req.url?.includes('/update')) {
      // Update a user
      const { userId, username, firstName, email, password, isAdmin } = req.body;
      
      if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
      }
      
      // Check if user exists
      const existingUser = await db.select().from(users).where(eq(users.id, parseInt(userId))).limit(1);
      
      if (!existingUser || existingUser.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Check if username already exists (for another user)
      if (username && username !== existingUser[0].username) {
        const userWithSameName = await db
          .select()
          .from(users)
          .where(eq(users.username, username))
          .limit(1);
        
        if (userWithSameName && userWithSameName.length > 0) {
          return res.status(400).json({ message: 'Username already exists' });
        }
      }
      
      // Prepare update data
      const updateData: Record<string, any> = {};
      
      if (username) {
        updateData.username = username;
      }
      
      if (password) {
        updateData.password = await bcrypt.hash(password, 10);
      }
      
      if (isAdmin !== undefined) {
        updateData.isAdmin = isAdmin === 'true' || isAdmin === true;
      }
      
      // Update user if there are changes
      if (Object.keys(updateData).length > 0) {
        const [updated] = await db.update(users)
          .set(updateData)
          .where(eq(users.id, parseInt(userId)))
          .returning();
          
        return res.status(200).json({ 
          id: updated.id.toString(),
          username: updated.username,
          isAdmin: updated.isAdmin,
          firstName: firstName || '',
          email: email || updated.username,
          imageUrl: '',
        });
      }
      
      return res.status(200).json({ 
        id: existingUser[0].id.toString(),
        username: existingUser[0].username,
        isAdmin: existingUser[0].isAdmin,
        firstName: firstName || '',
        email: email || existingUser[0].username,
        imageUrl: '',
      });
    } else if (req.method === 'POST' && req.url?.includes('/delete')) {
      // Delete a user
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
      }
      
      // Check if user exists
      const existingUser = await db.select().from(users).where(eq(users.id, parseInt(userId))).limit(1);
      
      if (!existingUser || existingUser.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Delete the user
      await db.delete(users).where(eq(users.id, parseInt(userId)));
      
      return res.status(200).json({ message: 'User deleted successfully' });
    } else {
      return res.status(404).json({ message: 'Endpoint not found' });
    }
  } catch (error) {
    console.error('Error handling users request:', error);
    return res.status(500).json({ message: 'An error occurred while processing the request' });
  }
}
