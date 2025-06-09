import { Pool, neonConfig } from '@neondatabase/serverless';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { date, integer, pgTable, serial, time, varchar } from 'drizzle-orm/pg-core';
import ws from 'ws';

// Ensure environment variables are loaded
config();

neonConfig.webSocketConstructor = ws;

// Embedded minimal schema for this API route
const bookings = pgTable('bookings', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  email: varchar('email', { length: 100 }).notNull(),
  phone: varchar('phone', { length: 20 }).notNull(),
  service: integer('service').notNull(),
  date: date('date').notNull(),
  time: time('time', { precision: 0 }).notNull(),
  status: varchar('status', { length: 20 }).default('pending').notNull(),
});

// Create database connection function to ensure fresh connections in serverless environment
function createDbConnection() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL must be set. Did you forget to provision a database?');
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  return drizzle({ client: pool, schema: { bookings } });
}

export default async function handler(request: VercelRequest, response: VercelResponse) {
  // Only POST is supported
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Create a new DB connection for this request
    const db = createDbConnection();

    const { name, email, phone, service, date, time } = request.body;

    if (!name || !email || !phone || !service || !date || !time) {
      return response.status(400).json({
        message: 'All fields are required',
      });
    }

    // Insert booking into database
    const serviceValue = typeof service === 'number' ? service : Number.parseInt(service, 10);

    // Make sure we have a valid service ID
    if (isNaN(serviceValue)) {
      return response.status(400).json({
        message: 'Invalid service ID. Please select a valid service.',
      });
    }

    const result = await db
      .insert(bookings)
      .values({
        name,
        email,
        phone,
        service: serviceValue, // Using the column name that matches the database schema
        date,
        time,
        status: 'pending',
      })
      .returning();

    return response.status(200).json({
      success: true,
      message: 'Booking confirmed!',
      data: result[0],
    });
  } catch (error) {
    console.error('Error processing booking:', error);

    // Provide a more informative error message if possible
    let errorMessage = 'Failed to process booking. Please try again later.';

    if (error instanceof Error) {
      // Check if it's a database-related error
      if (error.message.includes('column') && error.message.includes('does not exist')) {
        errorMessage =
          'Database schema mismatch. Please contact support with error code: DB-SCHEMA-001';
        console.error('Schema mismatch detected in bookings table:', error.message);
      } else if (error.message.includes('violates foreign key constraint')) {
        errorMessage = 'The selected service is not valid. Please choose another service.';
      }
    }

    return response.status(500).json({
      message: errorMessage,
      success: false,
    });
  }
}
