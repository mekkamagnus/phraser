import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { db } from './index';
import Database from 'better-sqlite3';

// Run migrations from the drizzle folder
export async function runMigrations() {
  const sqlite = new Database('./phraser.db');

  try {
    await migrate(db, { migrationsFolder: './drizzle' });
    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}
