import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment configurations
dotenv.config({ path: path.join(__dirname, '.env') });

// Build database connection URL from individual DB_* env variables
const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;
const databaseUrl = `mysql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;

if (!DB_HOST || !DB_PORT || !DB_USER || !DB_NAME) {
  console.error('Error: One or more required DB environment variables are missing in server/.env (DB_PASSWORD can be empty)');
  process.exit(1);
}

async function seed() {
  console.log('[SEEDER]: Connecting to MySQL database...');
  let connection;
  try {
    connection = await mysql.createConnection(databaseUrl);
    console.log('[SEEDER]: Connected successfully.');

    console.log('[SEEDER]: Seeding default staff accounts into `users` table...');
    
    // Hash default login passwords
    const managerHash = await bcrypt.hash('managerSecure2026!', 10);
    const agentHash = await bcrypt.hash('agentSecure2026!', 10);

    // Insert Manager Account
    await connection.query(
      `INSERT INTO users (id, name, email, password_hash, role) 
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE name=VALUES(name), password_hash=VALUES(password_hash), role=VALUES(role)`,
      ['f93c66eb-bc46-4e58-9635-f0ea8bde0d12', 'Christine Nechesa', 'chrisine@gmail.com', managerHash, 'MANAGER']
    );
    console.log('[SEEDER]: Seeded Manager: chrisine@gmail.com / password: managerSecure2026!');

    // Insert Agent Account
    await connection.query(
      `INSERT INTO users (id, name, email, password_hash, role) 
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE name=VALUES(name), password_hash=VALUES(password_hash), role=VALUES(role)`,
      ['d9b73489-cf2b-4fa8-bc3c-c9d34fb05ea3', 'Caroline Nechesa', 'caroline@gmail.com', agentHash, 'AGENT']
    );
    console.log('[SEEDER]: Seeded Agent: caroline@gmail.com / password: agentSecure2026!');

    console.log('[SEEDER]: Database seeding completed successfully.');
  } catch (error) {
    console.error('[SEEDER ERROR]: Seeding process failed. Details:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

seed();
