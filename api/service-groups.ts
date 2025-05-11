import type { VercelRequest, VercelResponse } from '@vercel/node';
import { config } from 'dotenv';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { eq } from 'drizzle-orm';
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

// Helper function to transform DB service group to frontend format
function transformServiceGroup(group: any) {
  return {
    id: group.id,
    slug: group.slug,
    name: {
      en: group.nameEn,
      ar: group.nameAr,
      de: group.nameDe,
      tr: group.nameTr
    },
    description: {
      en: group.descriptionEn,
      ar: group.descriptionAr,
      de: group.descriptionDe,
      tr: group.descriptionTr
    },
    icon: group.icon,
    displayOrder: group.displayOrder
  };
}

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
    const { slug } = request.query;

    if (slug) {
      // Get specific service group by slug
      const group = await db.query.serviceGroups.findFirst({
        where: eq(schema.serviceGroups.slug, String(slug)),
      });

      if (!group) {
        return response.status(404).json({ message: 'Service group not found' });
      }

      // Get all services in this group
      const services = await db.query.services.findMany({
        where: eq(schema.services.groupId, group.id),
      });

      const transformedGroup = transformServiceGroup(group);
      const transformedServices = services.map(service => ({
        id: service.id,
        slug: service.slug,
        name: {
          en: service.nameEn,
          ar: service.nameAr,
          de: service.nameDe,
          tr: service.nameTr
        },
        duration: service.duration,
        price: service.price,
        imageUrl: service.imageUrl
      }));

      return response.status(200).json({
        ...transformedGroup,
        services: transformedServices
      });
    } else {
      // Get all service groups with their associated services
      const groups = await db.query.serviceGroups.findMany({
        orderBy: (serviceGroups, { asc }) => [asc(serviceGroups.displayOrder)]
      });

      const result = await Promise.all(groups.map(async (group) => {
        const services = await db.query.services.findMany({
          where: (services) => eq(services.groupId, group.id),
        });

        const transformedGroup = transformServiceGroup(group);
        const transformedServices = services.map(service => ({
          id: service.id,
          slug: service.slug,
          name: {
            en: service.nameEn,
            ar: service.nameAr,
            de: service.nameDe,
            tr: service.nameTr
          },
          duration: service.duration,
          price: service.price,
          imageUrl: service.imageUrl
        }));

        return {
          ...transformedGroup,
          services: transformedServices
        };
      }));

      return response.status(200).json(result);
    }
  } catch (error) {
    console.error('Error getting service groups:', error);
    return response.status(500).json({
      message: 'Failed to retrieve service groups. Please try again later.'
    });
  }
}
