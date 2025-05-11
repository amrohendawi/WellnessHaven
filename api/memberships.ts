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

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle({ client: pool, schema });

// Helper function to transform membership data
function transformMembership(membership: any) {
  return {
    id: membership.id,
    tier: membership.tier,
    name: {
      en: membership.nameEn,
      ar: membership.nameAr,
      de: membership.nameDe,
      tr: membership.nameTr
    },
    description: {
      en: membership.descriptionEn,
      ar: membership.descriptionAr,
      de: membership.descriptionDe,
      tr: membership.descriptionTr
    },
    benefits: {
      en: membership.benefitsEn ? membership.benefitsEn.split('|') : [],
      ar: membership.benefitsAr ? membership.benefitsAr.split('|') : [],
      de: membership.benefitsDe ? membership.benefitsDe.split('|') : [],
      tr: membership.benefitsTr ? membership.benefitsTr.split('|') : []
    },
    price: membership.price,
    discountPercentage: membership.discountPercentage,
    validity: membership.validity,
    color: membership.color,
    isPopular: membership.isPopular
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
    const { type } = request.query;
    
    if (type) {
      // Get specific membership by type
      const membership = await db.query.memberships.findFirst({
        where: (memberships) => eq(memberships.type, String(type)),
      });
      
      if (!membership) {
        return response.status(404).json({ message: 'Membership type not found' });
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
      message: 'Failed to retrieve memberships. Please try again later.' 
    });
  }
}
