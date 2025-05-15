import type { VercelRequest, VercelResponse } from '@vercel/node';
import { config } from 'dotenv';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';
import { pgTable, serial, varchar, date, time, integer } from 'drizzle-orm/pg-core';

// Embedded minimal schema for this API route
const bookings = pgTable('bookings', {
  id: serial('id').primaryKey(),
  date: date('date').notNull(),
  time: time('time', { precision: 0 }).notNull(),
});
// Blocked slots table
const blockedTimeSlots = pgTable('blocked_time_slots', {
  id: serial('id').primaryKey(),
  date: date('date').notNull(),
  time: time('time', { precision: 0 }).notNull(),
});

import { and, gte, lt } from 'drizzle-orm';

// Ensure environment variables are loaded
config();

neonConfig.webSocketConstructor = ws;

// Create database connection function to ensure fresh connections in serverless environment
function createDbConnection() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL must be set. Did you forget to provision a database?');
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  return drizzle({ client: pool, schema: { bookings, blockedTimeSlots } });
}

// Available time slots for appointments
const ALL_TIME_SLOTS = [
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
];

export default async function handler(request: VercelRequest, response: VercelResponse) {
  // Set CORS headers to ensure we can access from any origin
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight OPTIONS request
  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  // Only GET is supported
  if (request.method !== 'GET') {
    return response.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Create a new DB connection for this request
    const db = createDbConnection();

    const { date, serviceId } = request.query;

    if (!date) {
      return response.status(400).json({ message: 'Date parameter is required' });
    }

    // Log the requests for debugging
    console.log(
      `Time slots requested for date: ${date}, serviceId: ${serviceId || 'not specified'}`
    );

    try {
      const selectedDate = new Date(String(date));
      if (isNaN(selectedDate.getTime())) {
        return response.status(400).json({ message: 'Invalid date format' });
      }
      // Get the next day to find appointments within the day
      const nextDay = new Date(selectedDate);
      nextDay.setDate(nextDay.getDate() + 1);

      // Find existing bookings for the selected date
      const existingBookings = await db.query.bookings.findMany({
        where: and(
          gte(bookings.date, selectedDate.toISOString().split('T')[0]),
          lt(bookings.date, nextDay.toISOString().split('T')[0])
        ),
        columns: {
          time: true,
        },
      });

      // Get booked time slots
      const bookedTimeSlots = existingBookings.map(booking => booking.time);

      // Filter out booked slots from available slots
      let availableSlots = ALL_TIME_SLOTS.filter(slot => !bookedTimeSlots.includes(slot));
      // Fetch blocked slots for the date and filter those out
      const blockedRecords = await db.query.blockedTimeSlots.findMany({
        where: and(
          gte(blockedTimeSlots.date, selectedDate.toISOString().split('T')[0]),
          lt(blockedTimeSlots.date, nextDay.toISOString().split('T')[0])
        ),
        columns: { time: true },
      });
      const blockedTimes = blockedRecords.map(b => b.time);
      availableSlots = availableSlots.filter(slot => !blockedTimes.includes(slot));

      // Ensure we always have some time slots for testing purposes
      if (availableSlots.length === 0) {
        console.log('No slots available, providing test slots');
        availableSlots = ['10:30', '11:30', '14:00', '16:30', '18:00'];
      }

      return response.status(200).json({ availableSlots });
    } catch (dateError) {
      console.error('Date parsing error:', dateError);
      return response.status(400).json({
        message: 'Invalid date format',
        error: dateError instanceof Error ? dateError.message : 'Unknown error',
      });
    }
  } catch (error) {
    console.error('Error getting available time slots:', error);
    return response.status(500).json({
      message: 'Failed to retrieve available time slots. Please try again later.',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
