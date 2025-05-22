import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { db } from './db';
import { users } from '../shared/schema';
import { eq } from 'drizzle-orm';

// ES module equivalent for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import bcrypt from 'bcryptjs';
import { requireAuth } from './auth';

// Set up file storage for profile images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/profiles');

    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Use timestamp to make filename unique
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, 'profile-' + uniqueSuffix + ext);
  },
});

// Set up file filter for images
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
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

// Admin profile data comes from database now
// This is just a type definition for profile data
interface AdminProfile {
  username: string;
  firstName?: string;
  email?: string;
  imageUrl?: string;
}

// Get profile data
router.get('/profile', requireAuth, async (req, res) => {
  try {
    // Get the admin user from the database
    const adminUsers = await db.select({
      username: users.username,
      isAdmin: users.isAdmin,
      createdAt: users.createdAt
    }).from(users).where(eq(users.isAdmin, true)).limit(1);

    if (!adminUsers || adminUsers.length === 0) {
      return res.status(404).json({ message: 'Admin profile not found' });
    }

    // Return just the username and other public fields
    res.json({
      username: adminUsers[0].username,
      // Additional fields will be added when those columns are added to DB
      firstName: 'Admin', // Default until we add these fields to the schema
      email: 'admin@dubairose.ae',
      imageUrl: ''
    });
  } catch (error) {
    console.error('Error fetching admin profile:', error);
    res.status(500).json({ message: 'Error fetching profile' });
  }
});

// Update profile
router.post('/profile/update', requireAuth, upload.single('profileImage'), async (req, res) => {
  try {
    const { username, firstName, email, password } = req.body;

    // Find the admin user
    const adminUsers = await db.select().from(users).where(eq(users.isAdmin, true)).limit(1);
    
    if (!adminUsers || adminUsers.length === 0) {
      return res.status(404).json({ message: 'Admin profile not found' });
    }
    
    const adminUser = adminUsers[0];
    
    // Prepare update data
    const updateData: Record<string, any> = {};
    
    // Update username if provided
    if (username && username !== adminUser.username) {
      updateData.username = username;
    }
    
    // Update password if provided
    if (password && password.trim() !== '') {
      const passwordHash = await bcrypt.hash(password, 10);
      updateData.password = passwordHash;
    }
    
    // Only update if there are changes
    if (Object.keys(updateData).length > 0) {
      await db.update(users)
        .set(updateData)
        .where(eq(users.id, adminUser.id));
    }
    
    // For now, we're not storing firstName, email, or imageUrl in the database
    // We would add these fields to the database schema in a production app
    
    // If an image was uploaded
    let imageUrl = '';
    if (req.file) {
      // Generate URL path to the uploaded image
      imageUrl = `/uploads/profiles/${req.file.filename}`;
    }

    // Get the updated user data
    const updatedUser = await db.select({
      username: users.username,
      isAdmin: users.isAdmin,
      createdAt: users.createdAt
    }).from(users).where(eq(users.id, adminUser.id)).limit(1);

    res.json({
      message: 'Profile updated successfully',
      profile: {
        username: updatedUser[0].username,
        firstName: firstName || 'Admin', // Placeholder
        email: email || 'admin@dubairose.ae', // Placeholder
        imageUrl: imageUrl || ''
      }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Error updating profile' });
  }
});

export default router;
