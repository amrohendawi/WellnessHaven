import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { Request, Router } from 'express';
import fs from 'fs';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { users } from '../shared/schema';
import { requireAuth } from './auth';
import { db } from './db';

// ES module equivalent for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set up file storage for profile images (same as in adminProfileRoutes)
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/profiles');

    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    // Use timestamp to make filename unique
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, 'profile-' + uniqueSuffix + ext);
  },
});

// Set up file filter for images
const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload only images.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Create router
const router = Router();

// Get all users
router.get('/users', requireAuth, async (_req, res) => {
  try {
    const allUsers = await db
      .select({
        id: users.id,
        username: users.username,
        isAdmin: users.isAdmin,
        createdAt: users.createdAt,
      })
      .from(users);

    // Format the users with additional fields
    // In the future, these could come from additional columns in the users table
    const formattedUsers = allUsers.map(user => ({
      ...user,
      id: user.id.toString(),
      firstName: '', // Placeholder until we add these fields to the schema
      email: user.username, // Assuming username is email
      imageUrl: '', // Placeholder for image URL
    }));

    res.json(formattedUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// Get a single user
router.get('/users/:userId', requireAuth, async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const user = await db
      .select({
        id: users.id,
        username: users.username,
        isAdmin: users.isAdmin,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, parseInt(userId)))
      .limit(1);

    if (!user || user.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Format the user response
    const formattedUser = {
      ...user[0],
      id: user[0].id.toString(),
      firstName: '', // Placeholder
      email: user[0].username,
      imageUrl: '',
    };

    res.json(formattedUser);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Error fetching user' });
  }
});

// Create a new user
router.post('/users/create', requireAuth, upload.single('profileImage'), async (req, res) => {
  try {
    const { username, password, isAdmin } = req.body;

    // Validate required fields
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    // Check if username already exists
    const existingUser = await db.select().from(users).where(eq(users.username, username)).limit(1);

    if (existingUser && existingUser.length > 0) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user

    // Handle profile image if uploaded
    // For a real app, you'd store this in the database and handle file paths

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Error creating user' });
  }
});

// Update a user
router.post('/users/update', requireAuth, upload.single('profileImage'), async (req, res) => {
  try {
    const { userId, username, password, isAdmin } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Check if user exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, parseInt(userId)))
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
      updateData.isAdmin = isAdmin === 'true';
    }

    // Update user if there are changes
    if (Object.keys(updateData).length > 0) {
      await db
        .update(users)
        .set(updateData)
        .where(eq(users.id, parseInt(userId)));
    }

    // Handle profile image if uploaded
    // For a real app, you'd store this in the database and handle file paths

    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Error updating user' });
  }
});

// Delete a user
router.post('/users/delete', requireAuth, async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Check if user exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, parseInt(userId)))
      .limit(1);

    if (!existingUser || existingUser.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete the user
    await db.delete(users).where(eq(users.id, parseInt(userId)));

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error deleting user' });
  }
});

export default router;
