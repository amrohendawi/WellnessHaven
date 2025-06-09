import { Pool, neonConfig } from '@neondatabase/serverless';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { boolean, integer, pgTable, serial, text, varchar } from 'drizzle-orm/pg-core';
import ws from 'ws';

// Embedded minimal schema for this API route
const memberships = pgTable('memberships', {
  id: serial('id').primaryKey(),
  tier: varchar('tier', { length: 50 }).notNull().unique(),
  nameEn: varchar('name_en', { length: 100 }).notNull(),
  nameAr: varchar('name_ar', { length: 100 }),
  nameDe: varchar('name_de', { length: 100 }),
  nameTr: varchar('name_tr', { length: 100 }),
  descriptionEn: text('description_en').notNull(),
  descriptionAr: text('description_ar'),
  descriptionDe: text('description_de'),
  descriptionTr: text('description_tr'),
  benefitsEn: text('benefits_en'),
  benefitsAr: text('benefits_ar'),
  benefitsDe: text('benefits_de'),
  benefitsTr: text('benefits_tr'),
  price: integer('price').notNull(),
  discountPercentage: integer('discount_percentage').default(0),
  validity: integer('validity').notNull(),
  color: varchar('color', { length: 20 }).default('#000000'),
  isPopular: boolean('is_popular').default(false),
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
  return drizzle({ client: pool, schema: { memberships } });
}

// Helper function to transform membership data
function transformMembership(membership: any) {
  return {
    id: membership.id,
    tier: membership.tier,
    name: {
      en: membership.nameEn,
      ar: membership.nameAr,
      de: membership.nameDe,
      tr: membership.nameTr,
    },
    description: {
      en: membership.descriptionEn,
      ar: membership.descriptionAr,
      de: membership.descriptionDe,
      tr: membership.descriptionTr,
    },
    benefits: {
      en: membership.benefitsEn ? membership.benefitsEn.split('|') : [],
      ar: membership.benefitsAr ? membership.benefitsAr.split('|') : [],
      de: membership.benefitsDe ? membership.benefitsDe.split('|') : [],
      tr: membership.benefitsTr ? membership.benefitsTr.split('|') : [],
    },
    price: membership.price,
    discountPercentage: membership.discountPercentage,
    validity: membership.validity,
    color: membership.color,
    isPopular: membership.isPopular,
  };
}

export default async function handler(request: VercelRequest, response: VercelResponse) {
  // Only GET is supported
  if (request.method !== 'GET') {
    return response.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Create a new DB connection for this request
    const db = createDbConnection();

    const { tier } = request.query;

    if (tier) {
      // Get specific membership by type
      const membership = await db.query.memberships.findFirst({
        where: membershipsTable => eq(membershipsTable.tier, String(tier)),
      });

      if (!membership) {
        return response.status(404).json({ message: 'Membership tier not found' });
      }

      return response.status(200).json(transformMembership(membership));
    } else {
      // Get all memberships
      const memberships = await db.query.memberships.findMany({});

      const transformedMemberships = memberships.map(transformMembership);

      return response.status(200).json(transformedMemberships);
    }
  } catch (error) {
    console.error('Error getting memberships:', error);
    return response.status(500).json({
      message: 'Failed to retrieve memberships. Please try again later.',
    });
  }
}
