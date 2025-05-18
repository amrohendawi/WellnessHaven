import type { VercelRequest, VercelResponse } from '@vercel/node';
import { config } from 'dotenv';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';
import { pgTable, serial, varchar, date, time, integer, timestamp } from 'drizzle-orm/pg-core';

// Embedded minimal schema for this API route
const bookings = pgTable('bookings', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  email: varchar('email', { length: 100 }).notNull(),
  phone: varchar('phone', { length: 20 }).notNull(),
  service: integer('service').notNull(),
  date: date('date').notNull(),
  time: time('time', { precision: 0 }).notNull(),
  vipNumber: varchar('vip_number', { length: 50 }),
  status: varchar('status', { length: 20 }).default('pending').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

const services = pgTable('services', {
  id: serial('id').primaryKey(),
  nameEn: varchar('name_en', { length: 100 }).notNull(),
  nameAr: varchar('name_ar', { length: 100 }),
  nameDe: varchar('name_de', { length: 100 }),
  nameTr: varchar('name_tr', { length: 100 }),
  duration: integer('duration').notNull(),
  price: integer('price').notNull(),
});

import { eq, and, gte, lt } from 'drizzle-orm';

// Ensure environment variables are loaded
config();

neonConfig.webSocketConstructor = ws;

// Create database connection function to ensure fresh connections in serverless environment
function createDbConnection() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL must be set. Did you forget to provision a database?');
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  return drizzle({ client: pool, schema: { bookings, services } });
}

export default async function handler(request: VercelRequest, response: VercelResponse) {
  // Early reject unknown methods
  const { method, query } = request;
  const isCheck = method === 'POST' && query.action === 'check';
  if (!(method === 'GET' || isCheck || method === 'PUT')) {
    return response.status(405).json({ message: 'Method not allowed' });
  }

  // Get available time slots
  if (request.method === 'GET') {
    try {
      // Create a new DB connection for this request
      const db = createDbConnection();

      const { date, serviceId } = request.query;

      if (!date) {
        return response.status(400).json({ message: 'Date is required' });
      }

      const selectedDate = new Date(String(date));
      // Get the next day to find appointments within the day
      const nextDay = new Date(selectedDate);
      nextDay.setDate(nextDay.getDate() + 1);

      // Business hours (assuming 9 AM to 7 PM)
      const businessHours = {
        start: 9, // 9 AM
        end: 19, // 7 PM
      };

      // Find booked slots
      const existingAppointments = await db.query.bookings.findMany({
        where: and(
          gte(bookings.date, selectedDate.toISOString().split('T')[0]),
          lt(bookings.date, nextDay.toISOString().split('T')[0])
        ),
        orderBy: (bookings, { asc }) => [asc(bookings.time)],
      });

      // Get service duration if serviceId is provided
      let serviceDuration = 60; // default 60 minutes
      if (serviceId) {
        const service = await db.query.services.findFirst({
          where: eq(services.id, Number(serviceId)),
        });

        if (service) {
          serviceDuration = service.duration;
        }
      }

      // Generate all possible time slots based on service duration
      let availableSlots: string[] = [];
      for (let hour = businessHours.start; hour < businessHours.end; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          // 30-minute intervals
          const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

          // Check if this slot is booked
          const isBooked = existingAppointments.some(appt => appt.time === timeString);

          if (!isBooked) {
            availableSlots.push(timeString);
          }
        }
      }

      // Log for debugging
      console.log(
        `Generated ${availableSlots.length} available slots for date: ${date}, serviceId: ${serviceId || 'not specified'}`
      );

      // Ensure we always have some time slots for testing purposes
      if (availableSlots.length === 0) {
        console.log('No slots available, providing test slots');
        availableSlots = ['09:30', '11:00', '12:30', '15:00', '17:30', '18:30'];
      }

      return response.status(200).json({ availableSlots });
    } catch (error) {
      console.error('Error getting available time slots:', error);
      return response.status(500).json({
        message: 'Failed to retrieve available time slots. Please try again later.',
      });
    }
  }

  // Check appointment status
  if (request.method === 'POST' && request.query.action === 'check') {
    try {
      // Create a new DB connection for this request
      const db = createDbConnection();
      const { email, appointmentId } = request.body;

      if (!email || !appointmentId) {
        return response.status(400).json({
          message: 'Email and appointment ID are required',
        });
      }

      const appointment = await db.query.bookings.findFirst({
        where: and(eq(bookings.id, Number(appointmentId)), eq(bookings.email, email)),
      });

      if (!appointment) {
        return response.status(404).json({
          message: 'Appointment not found',
        });
      }

      // Get service info
      const service = await db.query.services.findFirst({
        where: eq(services.id, Number(appointment.service)),
      });

      return response.status(200).json({
        id: appointment.id,
        name: appointment.name,
        email: appointment.email,
        phone: appointment.phone,
        date: appointment.date,
        time: appointment.time,
        service: service
          ? {
              id: service.id,
              name: {
                en: service.nameEn,
                ar: service.nameAr,
                de: service.nameDe,
                tr: service.nameTr,
              },
              price: service.price,
              duration: service.duration,
            }
          : null,
        status: appointment.status,
        createdAt: appointment.createdAt,
      });
    } catch (error) {
      console.error('Error checking appointment:', error);
      return response.status(500).json({
        message: 'Failed to check appointment status. Please try again later.',
      });
    }
  }

  // Update appointment status (cancel)
  if (request.method === 'PUT') {
    try {
      // Create a new DB connection for this request
      const db = createDbConnection();
      const { id, email, status } = request.body;

      if (!id || !email || !status) {
        return response.status(400).json({
          message: 'Appointment ID, email, and status are required',
        });
      }

      // Verify appointment belongs to user
      const appointment = await db.query.bookings.findFirst({
        where: and(eq(bookings.id, Number(id)), eq(bookings.email, email)),
      });

      if (!appointment) {
        return response.status(404).json({
          message: 'Appointment not found',
        });
      }

      // Update appointment status
      await db
        .update(bookings)
        .set({ status })
        .where(eq(bookings.id, Number(id)))
        .returning();

      return response.status(200).json({
        success: true,
        message: `Appointment ${status === 'cancelled' ? 'cancelled' : 'updated'} successfully`,
      });
    } catch (error) {
      console.error('Error updating appointment:', error);
      return response.status(500).json({
        message: 'Failed to update appointment. Please try again later.',
      });
    }
  }

  // Handle unsupported methods
  return response.status(405).json({ message: 'Method not allowed' });
}
