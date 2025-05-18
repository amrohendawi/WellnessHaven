import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

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

// In-memory profile data store (would be a database in production)
const adminProfile = {
  username: process.env.ADMIN_USERNAME || 'admin',
  firstName: 'Admin',
  email: 'admin@dubairose.ae',
  imageUrl: '',
  passwordHash: '',
};

// Get profile data
router.get('/profile', requireAuth, (req, res) => {
  // Don't send password data to client
  const { passwordHash, ...profileData } = adminProfile;
  res.json(profileData);
});

// Update profile
router.post('/profile/update', requireAuth, upload.single('profileImage'), async (req, res) => {
  try {
    const { username, firstName, email, password } = req.body;

    // Update basic info
    if (username) adminProfile.username = username;
    if (firstName) adminProfile.firstName = firstName;
    if (email) adminProfile.email = email;

    // Update password if provided
    if (password && password.trim() !== '') {
      adminProfile.passwordHash = await bcrypt.hash(password, 10);

      // Update environment variable for development
      if (process.env.NODE_ENV === 'development') {
        process.env.ADMIN_PASSWORD = password;
        process.env.ADMIN_PASSWORD_HASH = adminProfile.passwordHash;
      }
    }

    // Add profile image URL if file was uploaded
    if (req.file) {
      // Generate URL path to the uploaded image
      const relativePath = `/uploads/profiles/${req.file.filename}`;
      adminProfile.imageUrl = relativePath;
    }

    // Return updated profile without password
    const { passwordHash, ...updatedProfile } = adminProfile;
    res.json({
      message: 'Profile updated successfully',
      profile: updatedProfile,
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

export default router;
