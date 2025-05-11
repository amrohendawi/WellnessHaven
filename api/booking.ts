import type { VercelRequest, VercelResponse } from '@vercel/node';
import { config } from 'dotenv';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "./schema";

// Ensure environment variables are loaded
config();

neonConfig.webSocketConstructor = ws;

// Create database connection function to ensure fresh connections in serverless environment
function createDbConnection() {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL must be set. Did you forget to provision a database?",
    );
  }
  
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  return drizzle({ client: pool, schema });
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
    const result = await db.insert(schema.bookings).values({
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
