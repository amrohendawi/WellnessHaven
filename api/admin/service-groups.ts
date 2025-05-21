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

// Helper function to transform DB service group to frontend format
function transformServiceGroup(group: any) {
  return {
    id: group.id,
    slug: group.slug,
    nameEn: group.name_en,
    nameAr: group.name_ar || '',
    nameDe: group.name_de || '',
    nameTr: group.name_tr || '',
    descriptionEn: group.description_en || '',
    descriptionAr: group.description_ar || '',
    descriptionDe: group.description_de || '',
    descriptionTr: group.description_tr || '',
    displayOrder: group.display_order || 0,
    isActive: group.is_active !== false,  // default to true if undefined
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

    // Handle GET - retrieve all service groups
    if (req.method === 'GET') {
      const { id } = req.query;
      
      if (id) {
        // Get specific service group
        const [group] = await db.execute(
          'SELECT * FROM service_groups WHERE id = $1',
          [id]
        );
        
        if (!group) {
          return res.status(404).json({ message: 'Service group not found' });
        }
        
        return res.status(200).json(transformServiceGroup(group));
      } else {
        // Get all service groups
        const groups = await db.execute(
          'SELECT * FROM service_groups ORDER BY display_order ASC'
        );
        
        return res.status(200).json(groups.map(transformServiceGroup));
      }
    }
    
    // Handle POST - create new service group
    else if (req.method === 'POST') {
      const { slug, name, description, displayOrder } = req.body;
      
      if (!slug || !name?.en) {
        return res.status(400).json({ message: 'Slug and English name are required' });
      }
      
      const [newGroup] = await db.execute(
        `INSERT INTO service_groups 
         (slug, name_en, name_ar, name_de, name_tr, description_en, description_ar, description_de, description_tr, display_order) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING *`,
        [
          slug, 
          name.en, 
          name.ar || '', 
          name.de || '', 
          name.tr || '',
          description?.en || '',
          description?.ar || '',
          description?.de || '',
          description?.tr || '',
          displayOrder || 0
        ]
      );
      
      return res.status(201).json(transformServiceGroup(newGroup));
    }
    
    // Handle PUT - update existing service group
    else if (req.method === 'PUT') {
      const { id } = req.query;
      
      if (!id) {
        return res.status(400).json({ message: 'Service group ID is required' });
      }
      
      const { slug, name, description, displayOrder, isActive } = req.body;
      
      // Build the SET part of the SQL dynamically based on what fields are present
      let setValues = [];
      let params = [];
      let paramCount = 1;
      
      if (slug !== undefined) {
        setValues.push(`slug = $${paramCount++}`);
        params.push(slug);
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
      
      if (displayOrder !== undefined) {
        setValues.push(`display_order = $${paramCount++}`);
        params.push(displayOrder);
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
      
      const [updatedGroup] = await db.execute(
        `UPDATE service_groups 
         SET ${setValues.join(', ')} 
         WHERE id = $${paramCount}
         RETURNING *`,
        params
      );
      
      if (!updatedGroup) {
        return res.status(404).json({ message: 'Service group not found' });
      }
      
      return res.status(200).json(transformServiceGroup(updatedGroup));
    }
    
    // Handle DELETE - remove service group
    else if (req.method === 'DELETE') {
      const { id } = req.query;
      
      if (!id) {
        return res.status(400).json({ message: 'Service group ID is required' });
      }
      
      // Check if this group has services before deleting
      const [serviceCount] = await db.execute(
        'SELECT COUNT(*) as count FROM services WHERE group_id = $1',
        [id]
      );
      
      if (serviceCount && Number(serviceCount.count) > 0) {
        return res.status(400).json({ 
          message: 'Cannot delete category with associated services. Remove the services first.' 
        });
      }
      
      await db.execute(
        'DELETE FROM service_groups WHERE id = $1',
        [id]
      );
      
      return res.status(204).end();
    }
    
    // Handle unsupported methods
    else {
      return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error handling service groups:', error);
    return res.status(500).json({
      message: 'An error occurred while processing your request.',
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
