import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { db } from '@/db';
import path from 'path';

// Run migrations on app startup
let migrationRan = false;

export async function ensureMigrations() {
  if (migrationRan) return;

  try {
    const migrationsFolder = path.join(process.cwd(), 'drizzle');
    await migrate(db, { migrationsFolder });
    console.log('✓ Database migrations completed');
    migrationRan = true;
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}
