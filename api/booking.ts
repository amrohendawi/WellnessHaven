import type { VercelRequest, VercelResponse } from '@vercel/node';
import { config } from 'dotenv';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import { pgTable, serial, varchar, date, time, integer, timestamp, text } from "drizzle-orm/pg-core";

// Ensure environment variables are loaded
config();

neonConfig.webSocketConstructor = ws;

// Embedded minimal schema for this API route
const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 100 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  service: integer("service_id").notNull(),
  date: date("date").notNull(),
  time: time("time", { precision: 0 }).notNull(),
  vipNumber: varchar("vip_number", { length: 50 }),
  status: varchar("status", { length: 20 }).default("pending").notNull()
});

// Create database connection function to ensure fresh connections in serverless environment
function createDbConnection() {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL must be set. Did you forget to provision a database?",
    );
  }
  
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  return drizzle({ client: pool, schema: { bookings } });
}

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  // Only POST is supported
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Method not allowed' });
  }
  
  try {
    // Create a new DB connection for this request
    const db = createDbConnection();
    
    const { name, email, phone, service, date, time, vipNumber } = request.body;
    
    if (!name || !email || !phone || !service || !date || !time) {
      return response.status(400).json({ 
        message: 'All fields are required except VIP membership number' 
      });
    }
    
    // Insert booking into database
    const result = await db.insert(bookings).values({
      name,
      email,
      phone,
      service,
      date,
      time,
      vipNumber: vipNumber || null,
      status: 'pending'
    }).returning();
    
    return response.status(200).json({ 
      success: true, 
      message: 'Booking confirmed!',
      data: result[0]
    });
  } catch (error) {
    console.error('Error processing booking:', error);
    return response.status(500).json({ 
      message: 'Failed to process booking. Please try again later.' 
    });
  }
}
