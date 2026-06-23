import pg from 'pg';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function runMigrations() {
  if (!process.env.DATABASE_URL) {
    console.error('Error: DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  console.log('Applying database migrations...');

  try {
    // Apply initial schema
    console.log('Applying 001_initial_schema.sql...');
    const schemaPath = path.join(process.cwd(), 'db', 'migrations', '001_initial_schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
    await pool.query(schemaSql);
    console.log('✓ 001_initial_schema.sql applied');

    // Apply nullable user_id migration
    console.log('Applying 002_make_user_id_nullable.sql...');
    const nullablePath = path.join(process.cwd(), 'db', 'migrations', '002_make_user_id_nullable.sql');
    const nullableSql = fs.readFileSync(nullablePath, 'utf-8');
    await pool.query(nullableSql);
    console.log('✓ 002_make_user_id_nullable.sql applied');

    console.log('Database migrations completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrations();
