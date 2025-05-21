import type { VercelRequest, VercelResponse } from '@vercel/node';
import { config } from 'dotenv';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';
import jwt from 'jsonwebtoken';

// Load environment variables
config();

// Verify JWT token from cookie
async function verifyToken(token: string): Promise<string | null> {
  try {
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    return decoded.userId;
  } catch (error) {
    return null;
  }
}

// We need to set this to make Neon work with serverless
neonConfig.webSocketConstructor = ws;

// Helper function to transform DB service to frontend format
function transformService(service: any) {
  return {
    id: service.id,
    slug: service.slug,
    category: service.category,
    groupId: service.group_id,
    nameEn: service.name_en,
    nameAr: service.name_ar || '',
    nameDe: service.name_de || '',
    nameTr: service.name_tr || '',
    descriptionEn: service.description_en || '',
    descriptionAr: service.description_ar || '',
    descriptionDe: service.description_de || '',
    descriptionTr: service.description_tr || '',
    longDescriptionEn: service.long_description_en || '',
    longDescriptionAr: service.long_description_ar || '',
    longDescriptionDe: service.long_description_de || '',
    longDescriptionTr: service.long_description_tr || '',
    duration: service.duration,
    price: service.price,
    imageUrl: service.image_url || '',
    isActive: service.is_active !== false,  // default to true if undefined
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS handling
  const origin = req.headers.origin;
  const allowedOrigins = [
    'https://dubai-rose.vercel.app',
    'https://dubai-rose-spa.vercel.app',
    'http://localhost:3000',
    'http://localhost:5173',
  ];
  
  // Allow Vercel preview URLs
  const isVercelPreview = origin && origin.endsWith('vercel.app');
  
  if (origin && (allowedOrigins.includes(origin) || isVercelPreview)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Auth check for all methods except GET
  if (req.method !== 'GET') {
    const cookieHeader = req.headers.cookie;
    if (!cookieHeader) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Extract token from cookies
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);

    const token = cookies.token;
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Verify token
    const userId = await verifyToken(token);
    if (!userId) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
  }
  
  try {
    // Create DB connection
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const db = drizzle(pool);

    // Handle GET - retrieve all services or a specific service
    if (req.method === 'GET') {
      const { id } = req.query;
      
      if (id) {
        // Get specific service
        const [service] = await db.execute(
          'SELECT * FROM services WHERE id = $1',
          [id]
        );
        
        if (!service) {
          return res.status(404).json({ message: 'Service not found' });
        }
        
        return res.status(200).json(transformService(service));
      } else {
        // Get all services
        const services = await db.execute(
          'SELECT * FROM services ORDER BY id ASC'
        );
        
        return res.status(200).json(services.map(transformService));
      }
    }
    
    // Handle POST - create new service
    else if (req.method === 'POST') {
      const { 
        slug, category, groupId, name, description, longDescription, 
        duration, price, imageUrl, isActive 
      } = req.body;
      
      if (!slug || !name?.en || !category) {
        return res.status(400).json({ message: 'Slug, category, and English name are required' });
      }
      
      const [newService] = await db.execute(
        `INSERT INTO services 
         (slug, category, group_id, name_en, name_ar, name_de, name_tr, 
          description_en, description_ar, description_de, description_tr,
          long_description_en, long_description_ar, long_description_de, long_description_tr,
          duration, price, image_url, is_active) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
         RETURNING *`,
        [
          slug, 
          category,
          groupId || null,
          name.en, 
          name.ar || '', 
          name.de || '', 
          name.tr || '',
          description?.en || '',
          description?.ar || '',
          description?.de || '',
          description?.tr || '',
          longDescription?.en || '',
          longDescription?.ar || '',
          longDescription?.de || '',
          longDescription?.tr || '',
          duration || 60,
          price || 0,
          imageUrl || '',
          isActive !== false
        ]
      );
      
      return res.status(201).json(transformService(newService));
    }
    
    // Handle PUT - update existing service
    else if (req.method === 'PUT') {
      const { id } = req.query;
      
      if (!id) {
        return res.status(400).json({ message: 'Service ID is required' });
      }
      
      const { 
        slug, category, groupId, name, description, longDescription, 
        duration, price, imageUrl, isActive 
      } = req.body;
      
      // Build the SET part of the SQL dynamically based on what fields are present
      let setValues = [];
      let params = [];
      let paramCount = 1;
      
      if (slug !== undefined) {
        setValues.push(`slug = $${paramCount++}`);
        params.push(slug);
      }
      
      if (category !== undefined) {
        setValues.push(`category = $${paramCount++}`);
        params.push(category);
      }
      
      if (groupId !== undefined) {
        setValues.push(`group_id = $${paramCount++}`);
        params.push(groupId);
      }
      
      if (name?.en !== undefined) {
        setValues.push(`name_en = $${paramCount++}`);
        params.push(name.en);
      }
      
      if (name?.ar !== undefined) {
        setValues.push(`name_ar = $${paramCount++}`);
        params.push(name.ar);
      }
      
      if (name?.de !== undefined) {
        setValues.push(`name_de = $${paramCount++}`);
        params.push(name.de);
      }
      
      if (name?.tr !== undefined) {
        setValues.push(`name_tr = $${paramCount++}`);
        params.push(name.tr);
      }
      
      if (description?.en !== undefined) {
        setValues.push(`description_en = $${paramCount++}`);
        params.push(description.en);
      }
      
      if (description?.ar !== undefined) {
        setValues.push(`description_ar = $${paramCount++}`);
        params.push(description.ar);
      }
      
      if (description?.de !== undefined) {
        setValues.push(`description_de = $${paramCount++}`);
        params.push(description.de);
      }
      
      if (description?.tr !== undefined) {
        setValues.push(`description_tr = $${paramCount++}`);
        params.push(description.tr);
      }
      
      if (longDescription?.en !== undefined) {
        setValues.push(`long_description_en = $${paramCount++}`);
        params.push(longDescription.en);
      }
      
      if (longDescription?.ar !== undefined) {
        setValues.push(`long_description_ar = $${paramCount++}`);
        params.push(longDescription.ar);
      }
      
      if (longDescription?.de !== undefined) {
        setValues.push(`long_description_de = $${paramCount++}`);
        params.push(longDescription.de);
      }
      
      if (longDescription?.tr !== undefined) {
        setValues.push(`long_description_tr = $${paramCount++}`);
        params.push(longDescription.tr);
      }
      
      if (duration !== undefined) {
        setValues.push(`duration = $${paramCount++}`);
        params.push(duration);
      }
      
      if (price !== undefined) {
        setValues.push(`price = $${paramCount++}`);
        params.push(price);
      }
      
      if (imageUrl !== undefined) {
        setValues.push(`image_url = $${paramCount++}`);
        params.push(imageUrl);
      }
      
      if (isActive !== undefined) {
        setValues.push(`is_active = $${paramCount++}`);
        params.push(isActive);
      }
      
      if (setValues.length === 0) {
        return res.status(400).json({ message: 'No fields to update' });
      }
      
      // Add the ID as the last parameter
      params.push(id);
      
      const [updatedService] = await db.execute(
        `UPDATE services 
         SET ${setValues.join(', ')} 
         WHERE id = $${paramCount}
         RETURNING *`,
        params
      );
      
      if (!updatedService) {
        return res.status(404).json({ message: 'Service not found' });
      }
      
      return res.status(200).json(transformService(updatedService));
    }
    
    // Handle DELETE - remove service
    else if (req.method === 'DELETE') {
      const { id } = req.query;
      
      if (!id) {
        return res.status(400).json({ message: 'Service ID is required' });
      }
      
      // Check if this service has any bookings before deleting
      // Omitting this check for now as we don't know the exact schema
      // In a real app, you'd want to verify dependencies before deleting
      
      await db.execute(
        'DELETE FROM services WHERE id = $1',
        [id]
      );
      
      return res.status(204).end();
    }
    
    // Handle unsupported methods
    else {
      return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error handling services:', error);
    return res.status(500).json({
      message: 'An error occurred while processing your request.',
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
