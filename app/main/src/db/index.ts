import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import * as schema from './schema';

let dbInstance: ReturnType<typeof drizzle> | null = null;
let sqliteInstance: Database.Database | null = null;

export function initDb() {
  if (dbInstance) return dbInstance;

  try {
    const projectRoot = process.cwd();
    const dataFolder = path.join(projectRoot, 'data');
    
    if (!fs.existsSync(dataFolder)) {
      fs.mkdirSync(dataFolder, { recursive: true });
    }

    const dbPath = path.join(dataFolder, 'data.db');
    console.log('[DB] Path:', dbPath);

    sqliteInstance = new Database(dbPath);
    const db = drizzle(sqliteInstance, { schema });

    const migrationsFolder = path.join(projectRoot, 'drizzle');
    
    console.log('[DB] Running migrations from:', migrationsFolder);
    migrate(db, { migrationsFolder });

    sqliteInstance.exec('PRAGMA foreign_keys = ON');
    
    dbInstance = db;
    console.log('[DB] Migrations applied successfully.');
    return dbInstance;

  } catch (error) {
    console.error('[DB] Error:', error);
    throw error;
  }
}

export function getDb() {
  if (!dbInstance) return initDb();
  return dbInstance;
}