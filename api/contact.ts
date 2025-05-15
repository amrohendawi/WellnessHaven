import type { VercelRequest, VercelResponse } from '@vercel/node';
import { config } from 'dotenv';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';
import { pgTable, serial, varchar, text } from 'drizzle-orm/pg-core';

// Embedded minimal schema for this API route
const contacts = pgTable('contacts', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  email: varchar('email', { length: 100 }).notNull(),
  phone: varchar('phone', { length: 20 }).notNull(),
  message: text('message').notNull(),
});

// Ensure environment variables are loaded
config();

neonConfig.webSocketConstructor = ws;

// Create database connection function to ensure fresh connections in serverless environment
function createDbConnection() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL must be set. Did you forget to provision a database?');
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  return drizzle({ client: pool, schema: { contacts } });
}

export default async function handler(request: VercelRequest, response: VercelResponse) {
  // Allow CORS
  response.setHeader('Access-Control-Allow-Credentials', 'true');
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  response.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Create a new DB connection for this request
    const db = createDbConnection();

    const { name, email, phone, message } = request.body;

    if (!name || !email || !phone || !message) {
      return response.status(400).json({
        message: 'All fields are required',
      });
    }

    // Insert contact submission into database
    const result = await db
      .insert(contacts)
      .values({
        name,
        email,
        phone,
        message,
      })
      .returning();

    return response.status(200).json({
      success: true,
      message: 'Message received! We will contact you soon.',
      data: result[0],
    });
  } catch (error) {
    console.error('Error submitting contact form:', error);
    return response.status(500).json({
      message: 'Failed to process your request. Please try again later.',
    });
  }
}
