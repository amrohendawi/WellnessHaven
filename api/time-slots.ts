import type { VercelRequest, VercelResponse } from '@vercel/node';
import { config } from 'dotenv';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "../shared/schema";
import { eq, and, gte, lt } from 'drizzle-orm';

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

// Available time slots for appointments
const ALL_TIME_SLOTS = [
  '10:00', '11:00', '12:00', '13:00', '14:00', 
  '15:00', '16:00', '17:00', '18:00', '19:00'
];

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  // Allow CORS
  response.setHeader('Access-Control-Allow-Credentials', 'true');
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  response.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );
  
  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }
  
  if (request.method !== 'GET') {
    return response.status(405).json({ message: 'Method not allowed' });
  }
  
  try {
    const { date } = request.query;
    
    if (!date) {
      return response.status(400).json({ message: 'Date parameter is required' });
    }
    
    const selectedDate = new Date(String(date));
    // Get the next day to find appointments within the day
    const nextDay = new Date(selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);
    
    // Find existing bookings for the selected date
    const existingBookings = await db.query.bookings.findMany({
      where: and(
        gte(schema.bookings.date, selectedDate.toISOString().split('T')[0]),
        lt(schema.bookings.date, nextDay.toISOString().split('T')[0])
      ),
      columns: {
        time: true
      }
    });
    
    // Get booked time slots
    const bookedTimeSlots = existingBookings.map(booking => booking.time);
    
    // Filter out booked slots from available slots
    const availableSlots = ALL_TIME_SLOTS.filter(slot => !bookedTimeSlots.includes(slot));
    
    return response.status(200).json({ availableSlots });
  } catch (error) {
    console.error('Error getting available time slots:', error);
    return response.status(500).json({ 
      message: 'Failed to retrieve available time slots. Please try again later.'
    });
  }
}
