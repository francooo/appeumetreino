import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

let dbUrl = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;

if (!dbUrl) {
  throw new Error("NEON_DATABASE_URL or DATABASE_URL must be set");
}

// Neon: channel_binding=require pode falhar com algumas versões do pg; usar prefer
if (dbUrl.includes("channel_binding=require")) {
  dbUrl = dbUrl.replace("channel_binding=require", "channel_binding=prefer");
}

const pool = new pg.Pool({
  connectionString: dbUrl,
  ssl:
    dbUrl.includes("sslmode=require") || dbUrl.includes("neon.tech")
      ? { rejectUnauthorized: false }
      : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 15000,
});

pool.on("error", (err) => {
  console.error("Database pool error:", err);
});

export const db = drizzle(pool, { schema });

export async function testConnection(): Promise<boolean> {
  try {
    const client = await pool.connect();
    await client.query("SELECT 1");
    client.release();
    console.log("Database connection successful");
    return true;
  } catch (error) {
    console.error("Database connection failed:", error);
    return false;
  }
}

export { pool };
