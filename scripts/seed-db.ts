import { config } from 'dotenv';
import { db } from '../server/db';
import { services, memberships, serviceGroups, users } from '../shared/schema';
import { eq } from 'drizzle-orm';
import servicesData from './data/services.json';
import membershipsData from './data/memberships.json';
import serviceGroupsData from './data/service-groups.json' assert { type: 'json' };
import bcrypt from 'bcryptjs';

// Load environment variables from .env file
config();

// Simple console color functions
const green = (text: string) => `\x1b[32m${text}\x1b[0m`;
const red = (text: string) => `\x1b[31m${text}\x1b[0m`;
const yellow = (text: string) => `\x1b[33m${text}\x1b[0m`;
const blue = (text: string) => `\x1b[34m${text}\x1b[0m`;

/**
 * Clear existing data in the database
 */
async function clearData() {
  try {
    console.log(blue('Clearing existing data...'));
    // Delete in reverse order to respect foreign key constraints
    await db.delete(memberships);
    await db.delete(services);
    await db.delete(serviceGroups);
    // Only clear non-admin users if needed
    // await db.delete(users).where(eq(users.isAdmin, false));
    console.log(green('✓ Existing data cleared successfully.'));
  } catch (error) {
    console.error(red('✗ Error clearing existing data:'), error);
    throw error; // Re-throw to handle in main function
  }
}

/**
 * Seed services data
 */
async function seedServices() {
  try {
    // Check if services already exist
    const existingServices = await db.query.services.findMany();

    if (existingServices.length > 0) {
      return {
        count: existingServices.length,
        skipped: true,
      };
    }

    // Insert services
    const result = await db.insert(services).values(servicesData as any[]);
    return {
      count: servicesData.length,
      skipped: false,
    };
  } catch (error) {
    console.error(red('✗ Error seeding services:'), error);
    throw error;
  }
}

/**
 * Seed service groups data
 */
async function seedServiceGroups() {
  try {
    // Check if service groups already exist
    const existingGroups = await db.query.serviceGroups.findMany();

    if (existingGroups.length > 0) {
      return {
        count: existingGroups.length,
        skipped: true,
      };
    }

    // Insert service groups
    const result = await db.insert(serviceGroups).values(serviceGroupsData as any[]);
    return {
      count: serviceGroupsData.length,
      skipped: false,
    };
  } catch (error) {
    console.error(red('✗ Error seeding service groups:'), error);
    throw error;
  }
}

/**
 * Seed memberships data
 */
async function seedMemberships() {
  try {
    // Check if memberships already exist
    const existingMemberships = await db.query.memberships.findMany();

    if (existingMemberships.length > 0) {
      return {
        success: false,
        message: `Found ${existingMemberships.length} existing memberships. Skipping membership insertion.`,
      };
    }

    // Process memberships data to handle date objects
    const processedMembershipsData = membershipsData.map(membership => ({
      ...membership,
      expiresAt: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
    }));

    // Insert memberships
    await db.insert(memberships).values(processedMembershipsData);
    return {
      success: true,
      message: 'Memberships added successfully!',
    };
  } catch (error) {
    console.error(red('✗ Error seeding memberships:'), error);
    throw error;
  }
}

/**
 * Seed admin user
 */
async function seedAdminUser() {
  try {
    // Check if admin user already exists
    const existingAdminUsers = await db.select().from(users).where(eq(users.isAdmin, true));

    // Admin user data from environment variables
    const email = process.env.SEED_ADMIN_EMAIL;
    const password = process.env.SEED_ADMIN_PASSWORD;

    // Validate that admin credentials are provided in environment variables
    if (!email || !password) {
      console.error(red('Missing admin credentials in environment variables'));
      console.error(yellow('Please set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD in .env file'));
      throw new Error('Missing admin credentials');
    }

    // Hash the password for security
    const hashedPassword = await bcrypt.hash(password, 10);

    if (existingAdminUsers.length > 0) {
      // Update existing admin user with new credentials
      await db
        .update(users)
        .set({
          username: email,
          password: hashedPassword,
        })
        .where(eq(users.isAdmin, true));

      return {
        success: true,
        message: `Updated existing admin user credentials to ${email}.`,
      };
    }

    // If no admin user exists, we'll create a new one

    // Create the admin user
    await db.insert(users).values({
      username: email,
      password: hashedPassword,
      isAdmin: true,
      createdAt: new Date(),
    });

    return {
      success: true,
      message: 'Admin user created successfully!',
    };
  } catch (error) {
    console.error(red('✗ Error creating admin user:'), error);
    throw error;
  }
}

/**
 * Main seed function following drizzle best practices
 */
async function seed() {
  console.log(blue('🌱 Starting database seeding process...'));

  try {
    // Check for force reinitialize flag
    const forceReinitialize = process.argv.includes('--force') || process.argv.includes('-f');

    // Begin a batched operation for better performance
    const transaction = async () => {
      if (forceReinitialize) {
        console.log(yellow('Force flag detected. Reinitializing database...'));
        await clearData();
      }

      // Seed service groups first (because services reference them)
      const serviceGroupsResult = await seedServiceGroups();
      console.log(
        serviceGroupsResult.skipped
          ? yellow(
              `! Skipped seeding service groups. Found ${serviceGroupsResult.count} existing service groups.`
            )
          : green(`✓ Seeded ${serviceGroupsResult.count} service groups successfully.`)
      );

      // Seed services
      const servicesResult = await seedServices();
      console.log(
        servicesResult.skipped
          ? yellow(`! Skipped seeding services. Found ${servicesResult.count} existing services.`)
          : green(`✓ Seeded ${servicesResult.count} services successfully.`)
      );

      // Seed memberships
      const membershipsResult = await seedMemberships();
      console.log(
        membershipsResult.success
          ? green(`✓ ${membershipsResult.message}`)
          : yellow(`! ${membershipsResult.message}`)
      );

      // Seed admin user
      const adminUserResult = await seedAdminUser();
      console.log(
        adminUserResult.success
          ? green(`✓ ${adminUserResult.message}`)
          : yellow(`! ${adminUserResult.message}`)
      );
    };

    // Execute all database operations
    await transaction();

    console.log(green('✅ Database seeding completed successfully!'));
  } catch (error) {
    console.error(red('❌ Database seeding failed:'), error);
    process.exit(1);
  }
}

// Execute the seed function
seed()
  .catch(error => {
    console.error(red('❌ Unhandled error during seeding:'), error);
    process.exit(1);
  })
  .finally(() => {
    console.log(blue('👋 Seed process complete.'));
    process.exit(0);
  });
