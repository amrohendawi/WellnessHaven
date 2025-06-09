import { Pool, neonConfig } from '@neondatabase/serverless';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { config } from 'dotenv';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { integer, pgTable, serial, text, varchar } from 'drizzle-orm/pg-core';
import ws from 'ws';

// Embedded minimal schema for this API route
const serviceGroups = pgTable('service_groups', {
  id: serial('id').primaryKey(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  nameEn: varchar('name_en', { length: 100 }).notNull(),
  nameAr: varchar('name_ar', { length: 100 }),
  nameDe: varchar('name_de', { length: 100 }),
  nameTr: varchar('name_tr', { length: 100 }),
  descriptionEn: text('description_en'),
  descriptionAr: text('description_ar'),
  descriptionDe: text('description_de'),
  descriptionTr: text('description_tr'),
  displayOrder: integer('display_order').default(0),
});

const services = pgTable('services', {
  id: serial('id').primaryKey(),
  slug: varchar('slug', { length: 100 }).notNull(),
  groupId: integer('group_id').notNull(),
  nameEn: varchar('name_en', { length: 100 }).notNull(),
  nameAr: varchar('name_ar', { length: 100 }),
  nameDe: varchar('name_de', { length: 100 }),
  nameTr: varchar('name_tr', { length: 100 }),
  duration: integer('duration').notNull(),
  price: integer('price').notNull(),
  imageUrl: text('image_url'),
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
  return drizzle({ client: pool, schema: { serviceGroups, services } });
}

// Helper function to transform DB service group to frontend format
function transformServiceGroup(group: any) {
  return {
    id: group.id,
    slug: group.slug,
    name: {
      en: group.nameEn,
      ar: group.nameAr || '',
      de: group.nameDe || '',
      tr: group.nameTr || '',
    },
    description: {
      en: group.descriptionEn || '',
      ar: group.descriptionAr || '',
      de: group.descriptionDe || '',
      tr: group.descriptionTr || '',
    },
    // Add a default icon value since the column doesn't exist in production
    icon: '',
    displayOrder: group.displayOrder || 0,
  };
}

export default async function handler(request: VercelRequest, response: VercelResponse) {
  // Handle CORS
  const origin = request.headers.origin;

  // Allow these origins
  const allowedOrigins = [
    'https://dubai-rose.vercel.app',
    'http://localhost:3000',
    'http://localhost:5173',
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

  // Only GET is supported
  if (request.method !== 'GET') {
    return response.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Create a new DB connection for this request
    const db = createDbConnection();

    const { slug } = request.query;

    if (slug) {
      // Get specific service group by slug
      const group = await db.query.serviceGroups.findFirst({
        where: eq(serviceGroups.slug, String(slug)),
      });

      if (!group) {
        return response.status(404).json({ message: 'Service group not found' });
      }

      // Get all services in this group
      const serviceItems = await db.query.services.findMany({
        where: eq(services.groupId, group.id),
      });

      const transformedGroup = transformServiceGroup(group);
      const transformedServices = serviceItems.map(service => ({
        id: service.id,
        slug: service.slug,
        name: {
          en: service.nameEn,
          ar: service.nameAr || '',
          de: service.nameDe || '',
          tr: service.nameTr || '',
        },
        duration: service.duration,
        price: service.price,
        imageUrl: service.imageUrl,
      }));

      return response.status(200).json({
        ...transformedGroup,
        services: transformedServices,
      });
    } else {
      // Get all service groups with their associated services
      const groups = await db.query.serviceGroups.findMany({
        orderBy: (serviceGroups, { asc }) => [asc(serviceGroups.displayOrder)],
      });

      const result = await Promise.all(
        groups.map(async group => {
          const serviceItems = await db.query.services.findMany({
            where: eq(services.groupId, group.id),
          });

          const transformedGroup = transformServiceGroup(group);
          const transformedServices = serviceItems.map(service => ({
            id: service.id,
            slug: service.slug,
            name: {
              en: service.nameEn,
              ar: service.nameAr || '',
              de: service.nameDe || '',
              tr: service.nameTr || '',
            },
            duration: service.duration,
            price: service.price,
            imageUrl: service.imageUrl,
          }));

          return {
            ...transformedGroup,
            services: transformedServices,
          };
        })
      );

      return response.status(200).json(result);
    }
  } catch (error) {
    console.error('Error getting service groups:', error);
    return response.status(500).json({
      message: 'Failed to retrieve service groups. Please try again later.',
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
