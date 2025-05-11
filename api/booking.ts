import type { VercelRequest, VercelResponse } from '@vercel/node';
import { config } from 'dotenv';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "../shared/schema";

// Ensure environment variables are loaded
config();

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle({ client: pool, schema });

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
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
