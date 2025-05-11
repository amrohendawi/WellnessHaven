import { config } from "dotenv";
import { db } from "../server/db";
import { services, memberships } from "../shared/schema";
import servicesData from "./data/services.json";
import membershipsData from "./data/memberships.json";
import { eq } from "drizzle-orm";

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
    console.log(blue("Clearing existing data..."));
    // Delete in reverse order to respect foreign key constraints
    await db.delete(memberships);
    await db.delete(services);
    console.log(green("✓ Existing data cleared successfully."));
  } catch (error) {
    console.error(red("✗ Error clearing existing data:"), error);
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
        success: false,
        message: `Found ${existingServices.length} existing services. Skipping service insertion.`
      };
    }
    
    // Insert services
    await db.insert(services).values(servicesData);
    return {
      success: true,
      message: "Services added successfully!"
    };
  } catch (error) {
    console.error(red("✗ Error seeding services:"), error);
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
        message: `Found ${existingMemberships.length} existing memberships. Skipping membership insertion.`
      };
    }
    
    // Process memberships data to handle date objects
    const processedMembershipsData = membershipsData.map(membership => ({
      ...membership,
      expiresAt: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
    }));
    
    // Insert memberships
    await db.insert(memberships).values(processedMembershipsData);
    return {
      success: true,
      message: "Memberships added successfully!"
    };
  } catch (error) {
    console.error(red("✗ Error seeding memberships:"), error);
    throw error;
  }
}

/**
 * Main seed function following drizzle best practices
 */
async function seed() {
  console.log(blue("🌱 Starting database seeding process..."));

  try {
    // Check for force reinitialize flag
    const forceReinitialize = process.argv.includes('--force') || process.argv.includes('-f');

    // Begin a batched operation for better performance
    const transaction = async () => {
      if (forceReinitialize) {
        console.log(yellow("Force flag detected. Reinitializing database..."));
        await clearData();
      }

      // Seed services
      const servicesResult = await seedServices();
      console.log(servicesResult.success 
        ? green(`✓ ${servicesResult.message}`) 
        : yellow(`! ${servicesResult.message}`));

      // Seed memberships
      const membershipsResult = await seedMemberships();
      console.log(membershipsResult.success 
        ? green(`✓ ${membershipsResult.message}`) 
        : yellow(`! ${membershipsResult.message}`));
    };

    // Execute all database operations
    await transaction();
    
    console.log(green("✅ Database seeding completed successfully!"));
  } catch (error) {
    console.error(red("❌ Database seeding failed:"), error);
    process.exit(1);
  }
}

// Execute the seed function
seed()
  .catch((error) => {
    console.error(red("❌ Unhandled error during seeding:"), error);
    process.exit(1);
  })
  .finally(() => {
    console.log(blue("👋 Seed process complete."));
    process.exit(0);
  });