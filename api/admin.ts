import { Pool, neonConfig } from '@neondatabase/serverless';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import bcrypt from 'bcryptjs';
import cookie from 'cookie';
import { config } from 'dotenv';
import { eq, sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { boolean, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';
import jwt from 'jsonwebtoken';
import ws from 'ws';

// Load environment variables
config();

// We need to set this to make Neon work with serverless
neonConfig.webSocketConstructor = ws;

// Define schema elements needed for this file
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  isAdmin: boolean('is_admin').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

export const bookings = pgTable('bookings', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  date: text('date').notNull(),
  time: text('time').notNull(),
  service: text('service').notNull(),
  notes: text('notes'),
  status: text('status').default('pending'),
  created_at: timestamp('created_at').defaultNow(),
});

export const blockedTimeSlots = pgTable('blocked_time_slots', {
  id: serial('id').primaryKey(),
  date: text('date').notNull(),
  time: text('time').notNull(),
  created_at: timestamp('created_at').defaultNow(),
});

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
    isActive: group.is_active !== false, // default to true if undefined
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
    isActive: service.is_active !== false, // default to true if undefined
  };
}

// CORS handling helper function
function setupCORS(req: VercelRequest, res: VercelResponse): void {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS for browsers
  setupCORS(req, res);

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Verify authentication for all admin routes
  const authResult = await verifyAuth(req);
  if (!authResult.authenticated) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // Get the path after /api/admin/
  const path = req.url?.split('/api/admin/')[1]?.split('?')[0] || '';
  const pathParts = path.split('/');
  const mainPath = pathParts[0];

  // Create database connection
  const db = await createDbConnection();

  try {
    // Log path info to help debug routing issues
    console.log(`Admin API request for path: '${path}', mainPath: '${mainPath}'`);

    // Route based on path
    switch (mainPath) {
      case '':
      case 'dashboard':
      case 'dashboard-summary':
        return handleDashboardSummary(req, res);

      case 'service-groups':
        return handleServiceGroups(req, res, path.replace('service-groups', ''));

      case 'services':
        return handleServices(req, res, path.replace('services', ''));

      case 'users':
        return handleUsers(req, res, db, authResult);

      case 'bookings':
        return handleBookings(req, res, db);

      case 'blocked-slots':
        return handleBlockedSlots(req, res, db);

      case 'profile':
        return handleProfile(req, res, db, authResult);

      default:
        return res.status(404).json({ message: 'Endpoint not found' });
    }
  } catch (error: any) {
    console.error('Error handling admin request:', error);
    return res.status(500).json({
      message: 'An unexpected error occurred while processing the request',
      error: error.message,
    });
  }
}

// Auth verification helper
async function verifyAuth(
  req: VercelRequest
): Promise<{ authenticated: boolean; userId?: string }> {
  try {
    // Parse cookies
    const cookieHeader = req.headers.cookie;
    if (!cookieHeader) {
      return { authenticated: false };
    }

    // Extract token from cookies
    const cookies = cookie.parse(cookieHeader);
    const token = cookies.token;
    if (!token) {
      return { authenticated: false };
    }

    // Verify token
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    // Initialize database connection
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const db = drizzle({ client: pool });

    // Find user in database
    const userResults = await db
      .select()
      .from(users)
      .where(eq(users.id, Number.parseInt(decoded.userId)))
      .limit(1);

    if (!userResults || userResults.length === 0 || !userResults[0].isAdmin) {
      return { authenticated: false };
    }

    return { authenticated: true, userId: decoded.userId };
  } catch (error) {
    console.error('Auth verification error:', error);
    return { authenticated: false };
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

      const confirmedResult = await db.execute(
        sql`SELECT COUNT(*) as count FROM bookings WHERE status = ${'confirmed'}`
      );
      // Extract count from the result
      const confirmedRows = Array.isArray(confirmedResult)
        ? confirmedResult
        : confirmedResult.rows || [];
      confirmed = Number(confirmedRows[0]?.count) || 0;

      const pendingResult = await db.execute(
        sql`SELECT COUNT(*) as count FROM bookings WHERE status = ${'pending'}`
      );
      // Extract count from the result
      const pendingRows = Array.isArray(pendingResult) ? pendingResult : pendingResult.rows || [];
      pending = Number(pendingRows[0]?.count) || 0;
    } catch (e) {
      console.log('Error counting bookings (table may not exist yet):', e);
    }

    try {
      const servicesResult = await db.execute(sql`SELECT COUNT(*) as count FROM services`);
      // Extract count from the result
      const serviceRows = Array.isArray(servicesResult)
        ? servicesResult
        : servicesResult.rows || [];
      servicesCount = Number(serviceRows[0]?.count) || 0;
    } catch (e) {
      console.log('Error counting services (table may not exist yet):', e);
    }

    try {
      const blockedSlotsResult = await db.execute(
        sql`SELECT COUNT(*) as count FROM blocked_time_slots`
      );
      // Extract count from the result
      const blockedRows = Array.isArray(blockedSlotsResult)
        ? blockedSlotsResult
        : blockedSlotsResult.rows || [];
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
        const rows = Array.isArray(result) ? result : result.rows || [];
        const group = rows[0];

        if (!group) {
          return res.status(404).json({ message: 'Service group not found' });
        }

        return res.status(200).json(transformServiceGroup(group));
      } else {
        // Get all service groups
        const result = await db.execute(
          sql`SELECT * FROM service_groups ORDER BY display_order ASC`
        );
        // Convert query result to array
        const groups = Array.isArray(result) ? result : result.rows || [];

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
      const rows = Array.isArray(result) ? result : result.rows || [];
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
      const hasFieldsToUpdate =
        slug !== undefined ||
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
      const rows = Array.isArray(result) ? result : result.rows || [];
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
      const countRows = Array.isArray(serviceCountResult)
        ? serviceCountResult
        : serviceCountResult.rows || [];
      const serviceCount = Number(countRows[0]?.count || 0);
      if (serviceCount > 0) {
        return res.status(400).json({
          message: 'Cannot delete category with associated services. Remove the services first.',
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
        const rows = Array.isArray(result) ? result : result.rows || [];
        const service = rows[0];

        if (!service) {
          return res.status(404).json({ message: 'Service not found' });
        }

        return res.status(200).json(transformService(service));
      } else {
        // Get all services
        const result = await db.execute(sql`SELECT * FROM services ORDER BY id ASC`);
        // Convert query result to array
        const services = Array.isArray(result) ? result : result.rows || [];

        return res.status(200).json(services.map(transformService));
      }
    }

    // POST - Create a new service
    else if (req.method === 'POST') {
      // Log the incoming request body to help diagnose
      console.log('Received service creation request with body:', req.body);

      // Extract data using flat property names (nameEn instead of name.en)
      const {
        slug,
        category,
        groupId,
        nameEn,
        nameAr,
        nameDe,
        nameTr,
        descriptionEn,
        descriptionAr,
        descriptionDe,
        descriptionTr,
        longDescriptionEn,
        longDescriptionAr,
        longDescriptionDe,
        longDescriptionTr,
        duration,
        price,
        imageUrl,
        isActive,
      } = req.body;

      // Validate required fields
      if (!slug || !nameEn || !category) {
        return res.status(400).json({ message: 'Slug, category, and English name are required' });
      }

      let result;
      try {
        console.log('Creating new service with slug:', slug);

        result = await db.execute(sql`
          INSERT INTO services 
          (slug, category, group_id, name_en, name_ar, name_de, name_tr, 
           description_en, description_ar, description_de, description_tr,
           long_description_en, long_description_ar, long_description_de, long_description_tr,
           duration, price, image_url, is_active) 
          VALUES (
            ${slug}, 
            ${category},
            ${groupId || null},
            ${nameEn}, 
            ${nameAr || ''}, 
            ${nameDe || ''}, 
            ${nameTr || ''},
            ${descriptionEn || ''},
            ${descriptionAr || ''},
            ${descriptionDe || ''},
            ${descriptionTr || ''},
            ${longDescriptionEn || ''},
            ${longDescriptionAr || ''},
            ${longDescriptionDe || ''},
            ${longDescriptionTr || ''},
            ${duration || 60},
            ${price || 0},
            ${imageUrl || ''},
            ${isActive !== false}
          )
          RETURNING *
        `);

        console.log('Service created successfully');

        // Extract the first row from the result
        const rows = Array.isArray(result) ? result : result.rows || [];
        const newService = rows[0];
        return res.status(201).json(transformService(newService));
      } catch (dbError) {
        console.error('Error creating service:', dbError);
        return res.status(500).json({
          message: 'Database error when creating service',
          error: typeof dbError === 'object' ? JSON.stringify(dbError) : String(dbError),
        });
      }
    }

    // PUT - Update an existing service
    else if (req.method === 'PUT') {
      if (!id) {
        return res.status(400).json({ message: 'Service ID is required' });
      }

      const {
        slug,
        category,
        groupId,
        name,
        description,
        longDescription,
        duration,
        price,
        imageUrl,
        isActive,
      } = req.body;

      // Check if there are any fields to update
      const hasFieldsToUpdate =
        slug !== undefined ||
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
      if (groupId !== undefined)
        setParts.push(`group_id = ${groupId === null ? 'NULL' : `'${groupId}'`}`);
      if (name?.en !== undefined) setParts.push(`name_en = '${name.en}'`);
      if (name?.ar !== undefined) setParts.push(`name_ar = '${name.ar}'`);
      if (name?.de !== undefined) setParts.push(`name_de = '${name.de}'`);
      if (name?.tr !== undefined) setParts.push(`name_tr = '${name.tr}'`);
      if (description?.en !== undefined) setParts.push(`description_en = '${description.en}'`);
      if (description?.ar !== undefined) setParts.push(`description_ar = '${description.ar}'`);
      if (description?.de !== undefined) setParts.push(`description_de = '${description.de}'`);
      if (description?.tr !== undefined) setParts.push(`description_tr = '${description.tr}'`);
      if (longDescription?.en !== undefined)
        setParts.push(`long_description_en = '${longDescription.en}'`);
      if (longDescription?.ar !== undefined)
        setParts.push(`long_description_ar = '${longDescription.ar}'`);
      if (longDescription?.de !== undefined)
        setParts.push(`long_description_de = '${longDescription.de}'`);
      if (longDescription?.tr !== undefined)
        setParts.push(`long_description_tr = '${longDescription.tr}'`);
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
      const rows = Array.isArray(result) ? result : result.rows || [];
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

      console.log(`Attempting to delete service with ID: ${id}`);

      try {
        // Use parameterized query with sql template tag to prevent SQL injection
        const result = await db.execute(sql`DELETE FROM services WHERE id = ${id} RETURNING id`);

        // Check if any rows were affected
        const rows = Array.isArray(result) ? result : result.rows || [];

        if (!rows.length) {
          console.log(`No service found with ID: ${id}`);
          return res.status(404).json({ message: 'Service not found' });
        }

        console.log(`Successfully deleted service with ID: ${id}`);
        return res.status(204).end();
      } catch (dbError: any) {
        console.error(`Error deleting service with ID ${id}:`, dbError);
        return res.status(500).json({
          message: 'Database error when deleting service',
          error: dbError.message || String(dbError),
        });
      }
    }

    // Method not supported
    else {
      return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error handling services:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

// Handler for users management
async function handleUsers(
  req: VercelRequest,
  res: VercelResponse,
  db: any,
  _auth: { authenticated: boolean; userId?: string }
) {
  try {
    if (req.method === 'GET') {
      // Get all users
      const allUsers = await db
        .select({
          id: users.id,
          username: users.username,
          isAdmin: users.isAdmin,
          createdAt: users.createdAt,
        })
        .from(users);

      // Format the users with additional fields for compatibility with the frontend
      const formattedUsers = allUsers.map((user: any) => ({
        ...user,
        id: user.id.toString(),
        firstName: '', // Placeholder
        email: user.username,
        imageUrl: '',
      }));

      return res.status(200).json(formattedUsers);
    } else if (req.method === 'POST' && req.url?.includes('/create')) {
      // Create a new user
      const { username, firstName, email, password, isAdmin } = req.body;

      // Validate required fields
      if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
      }

      // Check if username already exists
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.username, username))
        .limit(1);

      if (existingUser && existingUser.length > 0) {
        return res.status(400).json({ message: 'Username already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create new user
      const [newUser] = await db
        .insert(users)
        .values({
          username,
          password: hashedPassword,
          isAdmin: isAdmin === 'true' || isAdmin === true,
          createdAt: new Date(),
        })
        .returning();

      return res.status(201).json({
        id: newUser.id.toString(),
        username: newUser.username,
        isAdmin: newUser.isAdmin,
        firstName: firstName || '',
        email: email || newUser.username,
        imageUrl: '',
      });
    } else if (req.method === 'POST' && req.url?.includes('/update')) {
      // Update a user
      const { userId, username, firstName, email, password, isAdmin } = req.body;

      if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
      }

      // Check if user exists
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.id, Number.parseInt(userId)))
        .limit(1);

      if (!existingUser || existingUser.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Check if username already exists (for another user)
      if (username && username !== existingUser[0].username) {
        const userWithSameName = await db
          .select()
          .from(users)
          .where(eq(users.username, username))
          .limit(1);

        if (userWithSameName && userWithSameName.length > 0) {
          return res.status(400).json({ message: 'Username already exists' });
        }
      }

      // Prepare update data
      const updateData: Record<string, any> = {};

      if (username) {
        updateData.username = username;
      }

      if (password) {
        updateData.password = await bcrypt.hash(password, 10);
      }

      if (isAdmin !== undefined) {
        updateData.isAdmin = isAdmin === 'true' || isAdmin === true;
      }

      // Update user if there are changes
      if (Object.keys(updateData).length > 0) {
        const [updated] = await db
          .update(users)
          .set(updateData)
          .where(eq(users.id, Number.parseInt(userId)))
          .returning();

        return res.status(200).json({
          id: updated.id.toString(),
          username: updated.username,
          isAdmin: updated.isAdmin,
          firstName: firstName || '',
          email: email || updated.username,
          imageUrl: '',
        });
      }

      return res.status(200).json({
        id: existingUser[0].id.toString(),
        username: existingUser[0].username,
        isAdmin: existingUser[0].isAdmin,
        firstName: firstName || '',
        email: email || existingUser[0].username,
        imageUrl: '',
      });
    } else if (req.method === 'POST' && req.url?.includes('/delete')) {
      // Delete a user
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
      }

      // Check if user exists
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.id, Number.parseInt(userId)))
        .limit(1);

      if (!existingUser || existingUser.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Delete the user
      await db.delete(users).where(eq(users.id, Number.parseInt(userId)));

      return res.status(200).json({ message: 'User deleted successfully' });
    } else {
      return res.status(404).json({ message: 'Endpoint not found' });
    }
  } catch (error: any) {
    console.error('Error handling users request:', error);
    return res.status(500).json({
      message: 'An error occurred while processing the request',
      error: error.message,
    });
  }
}

// Handler for bookings
async function handleBookings(req: VercelRequest, res: VercelResponse, db: any) {
  try {
    // Log the connection string (with sensitive info redacted)
    console.log(
      'Using database connection with hostname:',
      process.env.DATABASE_URL?.split('@')[1]?.split('/')[0] || 'unknown'
    );
    console.log('Bookings handler called with method:', req.method);

    // Check if bookings table exists using raw SQL to avoid schema issues
    try {
      const tablesResult = await db.execute(sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'bookings'
        );
      `);
      const tableExists = tablesResult[0]?.exists || false;
      console.log('Bookings table exists:', tableExists);

      if (!tableExists) {
        console.log('Creating bookings table since it does not exist');
        await db.execute(sql`
          CREATE TABLE IF NOT EXISTS bookings (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            phone TEXT NOT NULL,
            date TEXT NOT NULL,
            time TEXT NOT NULL,
            service TEXT NOT NULL,
            notes TEXT,
            status TEXT DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT NOW()
          );
        `);
        console.log('Bookings table created successfully');
      }
    } catch (schemaError: any) {
      console.error('Error checking/creating bookings table:', schemaError);
    }

    if (req.method === 'GET') {
      try {
        // Get all bookings with more robust error handling
        console.log('Attempting to fetch bookings from database');

        // Use raw SQL query to avoid schema issues
        const result = await db.execute(sql`SELECT * FROM bookings ORDER BY created_at DESC;`);
        const allBookings = Array.isArray(result) ? result : [];

        console.log(`Successfully retrieved ${allBookings.length} bookings`);
        return res.status(200).json(allBookings);
      } catch (dbError: any) {
        console.error('Database error when fetching bookings:', dbError);
        return res.status(500).json({
          message: 'Database error when fetching bookings',
          error: dbError.message,
        });
      }
    } else if (req.method === 'POST') {
      try {
        // Create a new booking
        const { name, email, phone, date, time, service, notes, status } = req.body;
        console.log('Creating new booking with data:', {
          name,
          email,
          phone,
          date,
          time,
          service,
        });

        // Use created_at field name instead of createdAt to match the schema
        const [newBooking] = await db
          .insert(bookings)
          .values({
            name,
            email,
            phone,
            date,
            time,
            service,
            notes,
            status: status || 'pending',
            created_at: new Date(),
          })
          .returning();

        console.log('Successfully created new booking with ID:', newBooking.id);
        return res.status(201).json(newBooking);
      } catch (dbError: any) {
        console.error('Database error when creating booking:', dbError);
        return res.status(500).json({
          message: 'Database error when creating booking',
          error: dbError.message,
        });
      }
    } else {
      return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error: any) {
    console.error('Unexpected error handling bookings request:', error);
    return res.status(500).json({
      message: 'An unexpected error occurred while processing the request',
      error: error.message,
    });
  }
}

// Handler for blocked slots
async function handleBlockedSlots(req: VercelRequest, res: VercelResponse, db: any) {
  try {
    // Log the connection string (with sensitive info redacted)
    console.log(
      'Using database connection with hostname:',
      process.env.DATABASE_URL?.split('@')[1]?.split('/')[0] || 'unknown'
    );
    console.log('Blocked Slots handler called with method:', req.method);

    // Check if blocked_time_slots table exists using raw SQL to avoid schema issues
    try {
      const tablesResult = await db.execute(sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'blocked_time_slots'
        );
      `);
      const tableExists = tablesResult[0]?.exists || false;
      console.log('Blocked time slots table exists:', tableExists);

      if (!tableExists) {
        console.log('Creating blocked_time_slots table since it does not exist');
        await db.execute(sql`
          CREATE TABLE IF NOT EXISTS blocked_time_slots (
            id SERIAL PRIMARY KEY,
            date TEXT NOT NULL,
            time TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT NOW()
          );
        `);
        console.log('Blocked time slots table created successfully');
      }
    } catch (schemaError: any) {
      console.error('Error checking/creating blocked_time_slots table:', schemaError);
    }

    if (req.method === 'GET') {
      try {
        console.log('Attempting to fetch blocked time slots from database');

        // Use raw SQL query to avoid schema issues
        const result = await db.execute(
          sql`SELECT * FROM blocked_time_slots ORDER BY date ASC, time ASC;`
        );
        const slots = Array.isArray(result) ? result : [];

        console.log(`Successfully retrieved ${slots.length} blocked time slots`);
        return res.status(200).json(slots);
      } catch (dbError: any) {
        console.error('Database error when fetching blocked time slots:', dbError);
        return res.status(500).json({
          message: 'Database error when fetching blocked slots',
          error: dbError.message,
        });
      }
    } else if (req.method === 'POST') {
      try {
        // Create a new blocked slot
        const { date, time } = req.body;
        console.log('Creating new blocked time slot with data:', {
          date,
          time,
        });

        if (!date || !time) {
          return res.status(400).json({ message: 'Date and time are required' });
        }

        // Use created_at field name instead of createdAt to match the schema
        const [newSlot] = await db
          .insert(blockedTimeSlots)
          .values({
            date,
            time,
            created_at: new Date(),
          })
          .returning();

        console.log('Successfully created new blocked time slot with ID:', newSlot.id);
        return res.status(201).json(newSlot);
      } catch (dbError: any) {
        console.error('Database error when creating blocked time slot:', dbError);
        return res.status(500).json({
          message: 'Database error when creating blocked slot',
          error: dbError.message,
        });
      }
    } else if (req.method === 'DELETE') {
      try {
        // Delete a blocked slot
        const id = Number.parseInt(req.query.id as string);
        console.log('Attempting to delete blocked time slot with ID:', id);

        if (isNaN(id)) {
          return res.status(400).json({ message: 'Valid ID is required' });
        }

        await db.delete(blockedTimeSlots).where(eq(blockedTimeSlots.id, id));
        console.log('Successfully deleted blocked time slot with ID:', id);
        return res.status(204).end();
      } catch (dbError: any) {
        console.error('Database error when deleting blocked time slot:', dbError);
        return res.status(500).json({
          message: 'Database error when deleting blocked slot',
          error: dbError.message,
        });
      }
    } else {
      return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error: any) {
    console.error('Unexpected error handling blocked slots request:', error);
    return res.status(500).json({
      message: 'An unexpected error occurred while processing the request',
      error: error.message,
    });
  }
}

// Handler for profile
async function handleProfile(
  req: VercelRequest,
  res: VercelResponse,
  db: any,
  auth: { authenticated: boolean; userId?: string }
) {
  try {
    if (req.method === 'GET') {
      // Get the admin user profile
      const userResults = await db
        .select({
          id: users.id,
          username: users.username,
          isAdmin: users.isAdmin,
          createdAt: users.createdAt,
        })
        .from(users)
        .where(eq(users.id, Number.parseInt(auth.userId!)))
        .limit(1);

      if (!userResults || userResults.length === 0) {
        return res.status(404).json({ message: 'Profile not found' });
      }

      // Return just the username and other public fields
      return res.status(200).json({
        id: userResults[0].id.toString(),
        username: userResults[0].username,
        firstName: 'Admin', // Default until we add these fields to the schema
        email: userResults[0].username,
        imageUrl: '',
      });
    } else if (req.method === 'POST' && req.url?.includes('/update')) {
      // Handle profile update
      const { username, firstName, email, password } = req.body;

      // Prepare update data
      const updateData: Record<string, any> = {};

      if (username) {
        updateData.username = username;
      }

      if (password) {
        updateData.password = await bcrypt.hash(password, 10);
      }

      // Update the user if there are changes
      if (Object.keys(updateData).length > 0) {
        await db
          .update(users)
          .set(updateData)
          .where(eq(users.id, Number.parseInt(auth.userId!)));
      }

      // Return updated profile data
      const updatedUser = await db
        .select({
          id: users.id,
          username: users.username,
          isAdmin: users.isAdmin,
        })
        .from(users)
        .where(eq(users.id, Number.parseInt(auth.userId!)))
        .limit(1);

      return res.status(200).json({
        id: updatedUser[0].id.toString(),
        username: updatedUser[0].username,
        firstName: firstName || 'Admin',
        email: email || updatedUser[0].username,
        imageUrl: '',
      });
    } else {
      return res.status(404).json({ message: 'Endpoint not found' });
    }
  } catch (error: any) {
    console.error('Error handling profile request:', error);
    return res.status(500).json({
      message: 'An error occurred while processing the request',
      error: error.message,
    });
  }
}
