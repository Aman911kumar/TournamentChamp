import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Fix __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env
dotenv.config({
  path: resolve(__dirname, '../.env')
});

console.log("DATABASE_URL:", process.env.DATABASE_URL);

// Required for Neon Serverless with WebSockets
neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });
