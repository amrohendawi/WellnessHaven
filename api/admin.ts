import type { VercelRequest, VercelResponse } from '@vercel/node';
import { config } from 'dotenv';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { sql } from 'drizzle-orm';
import ws from 'ws';
import jwt from 'jsonwebtoken';

// Load environment variables
config();

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
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Extract the path from the URL
  const urlPath = req.url || '';
  const pathParts = urlPath.split('/api/admin/')[1]?.split('?')[0] || '';
  const mainPath = pathParts.split('/')[0];
  
  // Auth check except for OPTIONS requests
  if (req.method !== 'OPTIONS') {
    // Verify authentication
    const isAuthenticated = await verifyAuth(req);
    if (!isAuthenticated) {
      return res.status(401).json({ message: 'Authentication required' });
    }
  }

  // Route to appropriate handler based on path
  if (mainPath === 'dashboard-summary') {
    return handleDashboardSummary(req, res);
  } else if (mainPath === 'service-groups') {
    return handleServiceGroups(req, res, pathParts);
  } else if (mainPath === 'services') {
    return handleServices(req, res, pathParts);
  } else {
    return res.status(404).json({ message: 'Endpoint not found' });
  }
}

// Auth verification helper
async function verifyAuth(req: VercelRequest): Promise<boolean> {
  try {
    const cookieHeader = req.headers.cookie;
    if (!cookieHeader) return false;

    // Extract token from cookies
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);

    const token = cookies.token;
    if (!token) return false;

    // Verify token
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
    
    try {
      jwt.verify(token, JWT_SECRET);
      return true;
    } catch (error) {
      return false;
    }
  } catch (error) {
    console.error('Auth check error:', error);
    return false;
  }
}

// Create database connection
function createDbConnection() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL must be set');
  }
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  return drizzle(pool);
}

// Dashboard summary handler
async function handleDashboardSummary(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const db = createDbConnection();
    
    // For this serverless function, simplify the database queries
    let totalBookings = 0;
    let confirmed = 0;
    let pending = 0;
    let servicesCount = 0;
    let blockedSlotsCount = 0;
    
    try {
      const result = await db.execute(sql`SELECT COUNT(*) as count FROM bookings`);
      totalBookings = Number(result[0]?.count) || 0;
      
      const confirmedResult = await db.execute(sql`SELECT COUNT(*) as count FROM bookings WHERE status = ${'confirmed'}`);
      // Extract count from the result
      const confirmedRows = Array.isArray(confirmedResult) ? confirmedResult : (confirmedResult.rows || []);
      confirmed = Number(confirmedRows[0]?.count) || 0;
      
      const pendingResult = await db.execute(sql`SELECT COUNT(*) as count FROM bookings WHERE status = ${'pending'}`);
      // Extract count from the result
      const pendingRows = Array.isArray(pendingResult) ? pendingResult : (pendingResult.rows || []);
      pending = Number(pendingRows[0]?.count) || 0;
    } catch (e) {
      console.log('Error counting bookings (table may not exist yet):', e);
    }
    
    try {
      const servicesResult = await db.execute(sql`SELECT COUNT(*) as count FROM services`);
      // Extract count from the result
      const serviceRows = Array.isArray(servicesResult) ? servicesResult : (servicesResult.rows || []);
      servicesCount = Number(serviceRows[0]?.count) || 0;
    } catch (e) {
      console.log('Error counting services (table may not exist yet):', e);
    }
    
    try {
      const blockedSlotsResult = await db.execute(sql`SELECT COUNT(*) as count FROM blocked_time_slots`);
      // Extract count from the result
      const blockedRows = Array.isArray(blockedSlotsResult) ? blockedSlotsResult : (blockedSlotsResult.rows || []);
      blockedSlotsCount = Number(blockedRows[0]?.count) || 0;
    } catch (e) {
      console.log('Error counting blocked slots (table may not exist yet):', e);
    }

    return res.status(200).json({
      totalBookings,
      confirmed,
      pending,
      servicesCount,
      blockedSlotsCount,
    });
  } catch (error) {
    console.error('Error getting dashboard summary:', error);
    return res.status(500).json({
      message: 'Failed to retrieve dashboard summary.',
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

// Service Groups Handler
async function handleServiceGroups(req: VercelRequest, res: VercelResponse, pathParts: string) {
  try {
    const db = createDbConnection();
    const parts = pathParts.split('/');
    const id = parts.length > 1 ? parts[1] : null;
    
    // GET - List all groups or get a specific group
    if (req.method === 'GET') {
      if (id) {
        // Get specific service group
        const result = await db.execute(sql`SELECT * FROM service_groups WHERE id = ${id}`);
        // Extract the first row from the query result
        const rows = Array.isArray(result) ? result : (result.rows || []);
        const group = rows[0];
        
        if (!group) {
          return res.status(404).json({ message: 'Service group not found' });
        }
        
        return res.status(200).json(transformServiceGroup(group));
      } else {
        // Get all service groups
        const result = await db.execute(sql`SELECT * FROM service_groups ORDER BY display_order ASC`);
        // Convert query result to array
        const groups = Array.isArray(result) ? result : (result.rows || []);
        
        return res.status(200).json(groups.map(transformServiceGroup));
      }
    }
    
    // POST - Create a new service group
    else if (req.method === 'POST') {
      const { slug, name, description, displayOrder } = req.body;
      
      if (!slug || !name?.en) {
        return res.status(400).json({ message: 'Slug and English name are required' });
      }
      
      const result = await db.execute(sql`
        INSERT INTO service_groups 
        (slug, name_en, name_ar, name_de, name_tr, description_en, description_ar, description_de, description_tr, display_order) 
        VALUES (
          ${slug}, 
          ${name.en}, 
          ${name.ar || ''}, 
          ${name.de || ''}, 
          ${name.tr || ''},
          ${description?.en || ''},
          ${description?.ar || ''},
          ${description?.de || ''},
          ${description?.tr || ''},
          ${displayOrder || 0}
        )
        RETURNING *
      `);
      
      // Extract the first row from the result
      const rows = Array.isArray(result) ? result : (result.rows || []);
      const newGroup = rows[0];
      return res.status(201).json(transformServiceGroup(newGroup));
    }
    
    // PUT - Update an existing service group
    else if (req.method === 'PUT') {
      if (!id) {
        return res.status(400).json({ message: 'Service group ID is required' });
      }
      
      const { slug, name, description, displayOrder, isActive } = req.body;
      
      // Check if there are any fields to update
      const hasFieldsToUpdate = slug !== undefined ||
        name?.en !== undefined ||
        name?.ar !== undefined ||
        name?.de !== undefined ||
        name?.tr !== undefined ||
        description?.en !== undefined ||
        description?.ar !== undefined ||
        description?.de !== undefined ||
        description?.tr !== undefined ||
        displayOrder !== undefined ||
        isActive !== undefined;
      
      if (!hasFieldsToUpdate) {
        return res.status(400).json({ message: 'No fields to update' });
      }
      
      // Create SQL string parts for the dynamic update
      const setParts = [];
      
      if (slug !== undefined) setParts.push(`slug = '${slug}'`);
      if (name?.en !== undefined) setParts.push(`name_en = '${name.en}'`);
      if (name?.ar !== undefined) setParts.push(`name_ar = '${name.ar}'`);
      if (name?.de !== undefined) setParts.push(`name_de = '${name.de}'`);
      if (name?.tr !== undefined) setParts.push(`name_tr = '${name.tr}'`);
      if (description?.en !== undefined) setParts.push(`description_en = '${description.en}'`);
      if (description?.ar !== undefined) setParts.push(`description_ar = '${description.ar}'`);
      if (description?.de !== undefined) setParts.push(`description_de = '${description.de}'`);
      if (description?.tr !== undefined) setParts.push(`description_tr = '${description.tr}'`);
      if (displayOrder !== undefined) setParts.push(`display_order = ${displayOrder}`);
      if (isActive !== undefined) setParts.push(`is_active = ${isActive}`);
      
      const setClause = setParts.join(', ');
      // Execute the query with the manually constructed SET clause
      const result = await db.execute(`
        UPDATE service_groups 
        SET ${setClause} 
        WHERE id = '${id}'
        RETURNING *
      `);
      
      // Extract the first row from the result
      const rows = Array.isArray(result) ? result : (result.rows || []);
      const updatedGroup = rows[0];
      if (!updatedGroup) {
        return res.status(404).json({ message: 'Service group not found' });
      }
      
      return res.status(200).json(transformServiceGroup(updatedGroup));
    }
    
    // DELETE - Remove service group
    else if (req.method === 'DELETE') {
      if (!id) {
        return res.status(400).json({ message: 'Service group ID is required' });
      }
      
      // Check if this group has services before deleting
      const serviceCountResult = await db.execute(sql`
        SELECT COUNT(*) as count FROM services WHERE group_id = ${id}
      `);
      
      // Extract count from the result
      const countRows = Array.isArray(serviceCountResult) ? serviceCountResult : (serviceCountResult.rows || []);
      const serviceCount = Number(countRows[0]?.count || 0);
      if (serviceCount > 0) {
        return res.status(400).json({ 
          message: 'Cannot delete category with associated services. Remove the services first.' 
        });
      }
      
      await db.execute(sql`DELETE FROM service_groups WHERE id = ${id}`);
      
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

// Services Handler
async function handleServices(req: VercelRequest, res: VercelResponse, pathParts: string) {
  try {
    const db = createDbConnection();
    const parts = pathParts.split('/');
    const id = parts.length > 1 ? parts[1] : null;
    
    // GET - List all services or get a specific service
    if (req.method === 'GET') {
      if (id) {
        // Get specific service
        const result = await db.execute(sql`SELECT * FROM services WHERE id = ${id}`);
        // Extract the first row from the query result
        const rows = Array.isArray(result) ? result : (result.rows || []);
        const service = rows[0];
        
        if (!service) {
          return res.status(404).json({ message: 'Service not found' });
        }
        
        return res.status(200).json(transformService(service));
      } else {
        // Get all services
        const result = await db.execute(sql`SELECT * FROM services ORDER BY id ASC`);
        // Convert query result to array
        const services = Array.isArray(result) ? result : (result.rows || []);
        
        return res.status(200).json(services.map(transformService));
      }
    }
    
    // POST - Create a new service
    else if (req.method === 'POST') {
      const { 
        slug, category, groupId, name, description, longDescription, 
        duration, price, imageUrl, isActive 
      } = req.body;
      
      if (!slug || !name?.en || !category) {
        return res.status(400).json({ message: 'Slug, category, and English name are required' });
      }
      
      const result = await db.execute(sql`
        INSERT INTO services 
        (slug, category, group_id, name_en, name_ar, name_de, name_tr, 
         description_en, description_ar, description_de, description_tr,
         long_description_en, long_description_ar, long_description_de, long_description_tr,
         duration, price, image_url, is_active) 
        VALUES (
          ${slug}, 
          ${category},
          ${groupId || null},
          ${name.en}, 
          ${name.ar || ''}, 
          ${name.de || ''}, 
          ${name.tr || ''},
          ${description?.en || ''},
          ${description?.ar || ''},
          ${description?.de || ''},
          ${description?.tr || ''},
          ${longDescription?.en || ''},
          ${longDescription?.ar || ''},
          ${longDescription?.de || ''},
          ${longDescription?.tr || ''},
          ${duration || 60},
          ${price || 0},
          ${imageUrl || ''},
          ${isActive !== false}
        )
        RETURNING *
      `);
      
      // Extract the first row from the result
      const rows = Array.isArray(result) ? result : (result.rows || []);
      const newService = rows[0];
      return res.status(201).json(transformService(newService));
    }
    
    // PUT - Update an existing service
    else if (req.method === 'PUT') {
      if (!id) {
        return res.status(400).json({ message: 'Service ID is required' });
      }
      
      const { 
        slug, category, groupId, name, description, longDescription, 
        duration, price, imageUrl, isActive 
      } = req.body;
      
      // Check if there are any fields to update
      const hasFieldsToUpdate = slug !== undefined || 
        category !== undefined || 
        groupId !== undefined || 
        name?.en !== undefined || 
        name?.ar !== undefined || 
        name?.de !== undefined || 
        name?.tr !== undefined || 
        description?.en !== undefined || 
        description?.ar !== undefined || 
        description?.de !== undefined || 
        description?.tr !== undefined || 
        longDescription?.en !== undefined || 
        longDescription?.ar !== undefined || 
        longDescription?.de !== undefined || 
        longDescription?.tr !== undefined || 
        duration !== undefined || 
        price !== undefined || 
        imageUrl !== undefined || 
        isActive !== undefined;
      
      if (!hasFieldsToUpdate) {
        return res.status(400).json({ message: 'No fields to update' });
      }
      
      // Create SQL string parts for the dynamic update
      const setParts = [];
      
      if (slug !== undefined) setParts.push(`slug = '${slug}'`);
      if (category !== undefined) setParts.push(`category = '${category}'`);
      if (groupId !== undefined) setParts.push(`group_id = ${groupId === null ? 'NULL' : `'${groupId}'`}`);
      if (name?.en !== undefined) setParts.push(`name_en = '${name.en}'`);
      if (name?.ar !== undefined) setParts.push(`name_ar = '${name.ar}'`);
      if (name?.de !== undefined) setParts.push(`name_de = '${name.de}'`);
      if (name?.tr !== undefined) setParts.push(`name_tr = '${name.tr}'`);
      if (description?.en !== undefined) setParts.push(`description_en = '${description.en}'`);
      if (description?.ar !== undefined) setParts.push(`description_ar = '${description.ar}'`);
      if (description?.de !== undefined) setParts.push(`description_de = '${description.de}'`);
      if (description?.tr !== undefined) setParts.push(`description_tr = '${description.tr}'`);
      if (longDescription?.en !== undefined) setParts.push(`long_description_en = '${longDescription.en}'`);
      if (longDescription?.ar !== undefined) setParts.push(`long_description_ar = '${longDescription.ar}'`);
      if (longDescription?.de !== undefined) setParts.push(`long_description_de = '${longDescription.de}'`);
      if (longDescription?.tr !== undefined) setParts.push(`long_description_tr = '${longDescription.tr}'`);
      if (duration !== undefined) setParts.push(`duration = ${duration}`);
      if (price !== undefined) setParts.push(`price = ${price}`);
      if (imageUrl !== undefined) setParts.push(`image_url = '${imageUrl}'`);
      if (isActive !== undefined) setParts.push(`is_active = ${isActive}`);
      
      const setClause = setParts.join(', ');
      // Execute the query with the manually constructed SET clause
      const result = await db.execute(`
        UPDATE services 
        SET ${setClause} 
        WHERE id = '${id}'
        RETURNING *
      `);
      
      // Extract the first row from the result
      const rows = Array.isArray(result) ? result : (result.rows || []);
      const updatedService = rows[0];
      if (!updatedService) {
        return res.status(404).json({ message: 'Service not found' });
      }
      
      return res.status(200).json(transformService(updatedService));
    }
    
    // DELETE - Remove service
    else if (req.method === 'DELETE') {
      if (!id) {
        return res.status(400).json({ message: 'Service ID is required' });
      }
      
      // Consider checking if service has associated bookings
      
      await db.execute(sql`DELETE FROM services WHERE id = ${id}`);
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
