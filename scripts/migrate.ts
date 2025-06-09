import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
// scripts/migrate.ts
import { config } from 'dotenv';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { db } from '../server/db';

// Load environment variables
config();

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Console formatting helpers
const green = (text: string) => `\x1b[32m${text}\x1b[0m`;
const red = (text: string) => `\x1b[31m${text}\x1b[0m`;
const blue = (text: string) => `\x1b[34m${text}\x1b[0m`;

async function runMigrations() {
  console.log(blue('🗃️ Running migrations...'));

  try {
    // The migrate function needs the path to the migrations folder
    const migrationsFolder = path.join(__dirname, '..', 'drizzle');

    // Run the migrations
    await migrate(db, { migrationsFolder });

    console.log(green('✅ Migrations completed successfully'));
  } catch (error) {
    console.error(red('❌ Migration failed:'), error);
    process.exit(1);
  }
}

runMigrations()
  .catch(error => {
    console.error(red('❌ Unhandled error:'), error);
    process.exit(1);
  })
  .finally(() => {
    console.log(blue('👋 Migration process complete.'));
    process.exit(0);
  });
