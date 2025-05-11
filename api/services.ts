import type { VercelRequest, VercelResponse } from '@vercel/node';
import { config } from 'dotenv';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "../shared/schema";
import { eq } from 'drizzle-orm';

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
      tr: service.nameTr
    },
    description: {
      en: service.descriptionEn,
      ar: service.descriptionAr,
      de: service.descriptionDe,
      tr: service.descriptionTr
    },
    longDescription: {
      en: service.longDescriptionEn,
      ar: service.longDescriptionAr,
      de: service.longDescriptionDe,
      tr: service.longDescriptionTr
    },
    duration: service.duration,
    price: service.price,
    imageUrl: service.imageUrl,
    imageLarge: service.imageLarge
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
    // Create a new DB connection for this request
    const db = createDbConnection();
    
    const { slug } = request.query;
    
    if (slug) {
      // Get specific service by slug
      const service = await db.query.services.findFirst({
        where: (services) => eq(services.slug, String(slug)),
      });
      
      if (!service) {
        return response.status(404).json({ message: 'Service not found' });
      }
      
      return response.status(200).json(transformService(service));
    } else {
      // Get all services
      const services = await db.query.services.findMany({
        where: (services) => eq(services.isActive, true),
      });
      
      const transformedServices = services.map(transformService);
      
      return response.status(200).json(transformedServices);
    }
  } catch (error) {
    console.error('Error getting services:', error);
    return response.status(500).json({ 
      message: 'Failed to retrieve services. Please try again later.' 
    });
  }
}
