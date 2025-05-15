import type { VercelRequest, VercelResponse } from '@vercel/node';
import { config } from 'dotenv';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';
import {
  pgTable,
  serial,
  varchar,
  text,
  boolean,
  integer,
  timestamp,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core';

// Embedded minimal schema for this API route
const services = pgTable('services', {
  id: serial('id').primaryKey(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  category: varchar('category', { length: 100 }),
  groupId: integer('group_id').notNull(),
  nameEn: varchar('name_en', { length: 100 }).notNull(),
  nameAr: varchar('name_ar', { length: 100 }),
  nameDe: varchar('name_de', { length: 100 }),
  nameTr: varchar('name_tr', { length: 100 }),
  descriptionEn: text('description_en').notNull(),
  descriptionAr: text('description_ar'),
  descriptionDe: text('description_de'),
  descriptionTr: text('description_tr'),
  longDescriptionEn: text('long_description_en'),
  longDescriptionAr: text('long_description_ar'),
  longDescriptionDe: text('long_description_de'),
  longDescriptionTr: text('long_description_tr'),
  duration: integer('duration').notNull(),
  price: integer('price').notNull(),
  imageUrl: text('image_url'),
  imageLarge: text('image_large'),
  isActive: boolean('is_active').default(true),
});

import { eq } from 'drizzle-orm';

// Ensure environment variables are loaded
config();

neonConfig.webSocketConstructor = ws;

// Create database connection function to ensure fresh connections in serverless environment
function createDbConnection() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL must be set. Did you forget to provision a database?');
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  return drizzle({ client: pool, schema: { services } });
}

// Helper function to transform DB service to frontend service format
function transformService(service: any) {
  return {
    id: service.id,
    slug: service.slug,
    category: service.category,
    groupId: service.groupId,
    name: {
      en: service.nameEn,
      ar: service.nameAr,
      de: service.nameDe,
      tr: service.nameTr,
    },
    description: {
      en: service.descriptionEn,
      ar: service.descriptionAr,
      de: service.descriptionDe,
      tr: service.descriptionTr,
    },
    longDescription: {
      en: service.longDescriptionEn,
      ar: service.longDescriptionAr,
      de: service.longDescriptionDe,
      tr: service.longDescriptionTr,
    },
    duration: service.duration,
    price: service.price,
    imageUrl: service.imageUrl,
    imageLarge: service.imageLarge,
  };
}

export default async function handler(request: VercelRequest, response: VercelResponse) {
  // Handle CORS
  const origin = request.headers.origin;
  
  // Allow these origins
  const allowedOrigins = [
    'https://dubai-rose.vercel.app',
    'https://dubai-rose-spa.vercel.app',
    'http://localhost:3000',
    'http://localhost:5173'
  ];
  
  // Allow Vercel preview URLs
  const isVercelPreview = origin && origin.endsWith('vercel.app');
  
  if (origin && (allowedOrigins.includes(origin) || isVercelPreview)) {
    response.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  // Set CORS headers
  response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }
  
  // Ensure database URL is configured
  if (!process.env.DATABASE_URL) {
    console.error('Missing DATABASE_URL environment variable');
    return response.status(500).json({ message: 'Server misconfiguration: DATABASE_URL not set' });
  }

  // Only GET is supported
  if (request.method !== 'GET') {
    return response.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Create a new DB connection for this request
    const db = createDbConnection();

    const { slug } = request.query;

    if (slug) {
      // Get specific service by slug
      const service = await db.query.services.findFirst({
        where: servicesTable => eq(servicesTable.slug, String(slug)),
      });

      if (!service) {
        return response.status(404).json({ message: 'Service not found' });
      }

      return response.status(200).json(transformService(service));
    } else {
      // Get all services
      const services = await db.query.services.findMany({
        where: servicesTable => eq(servicesTable.isActive, true),
      });

      const transformedServices = services.map(transformService);

      return response.status(200).json(transformedServices);
    }
  } catch (error: any) {
    console.error('Error getting services:', error);
    return response.status(500).json({ message: error.message || String(error) });
  }
}
