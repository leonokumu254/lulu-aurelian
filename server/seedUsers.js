import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;
const databaseUrl = `mysql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;

const USERS_TO_ADD = [
  { name: 'Carolyne Mutwiri', email: 'carolynemuwiri124@gmail.com', role: 'MANAGER' },
  { name: 'Christine Nechesa', email: 'pearlisprime@gmail.com', role: 'MANAGER' },
  { name: 'Leon Shireku', email: 'leonshireku@gmail.com', role: 'MANAGER' },
  { name: 'Diana Sanya', email: 'dianasanya13@gmail.com', role: 'AGENT' }
];

async function seedUsers() {
  console.log('[SEED USERS]: Starting user creation script...');
  const passwordHash = await bcrypt.hash('12345', 10);
  console.log('[SEED USERS]: Generated password hash for "12345":', passwordHash);

  let connection;
  try {
    connection = await mysql.createConnection(databaseUrl);
    console.log('[SEED USERS]: Connected to MySQL database.');

    for (const u of USERS_TO_ADD) {
      const id = crypto.randomUUID();
      await connection.query(
        `INSERT INTO users (id, name, email, password_hash, role)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE 
           name = VALUES(name), 
           password_hash = VALUES(password_hash), 
           role = VALUES(role)`,
        [id, u.name, u.email, passwordHash, u.role]
      );
      console.log(`[SEED USERS]: Successfully added/updated ${u.name} (${u.email}) as ${u.role}`);
    }

    console.log('[SEED USERS]: Local seeding complete.');
  } catch (err) {
    console.error('[SEED USERS ERROR]: Failed to seed local database:', err.message);
  } finally {
    if (connection) await connection.end();
  }
}

seedUsers();
