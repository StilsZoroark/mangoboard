import postgres from "postgres";

const connectionString = process.env.DATABASE_URL;

export const sql = connectionString
  ? postgres(connectionString, {
      ssl: { rejectUnauthorized: false },
      prepare: false,
    })
  : null;

// Auto-initialize the users and classification_cache tables inside Supabase if connected
if (sql) {
  sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      name VARCHAR(255),
      email VARCHAR(255) UNIQUE,
      phone VARCHAR(50) UNIQUE,
      password VARCHAR(255),
      image VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `.then(() => {
    console.log("[DB] Users table verified/created successfully.");
  }).catch((err) => {
    console.error("[DB] Failed to verify/create users table:", err);
  });

  sql`
    CREATE TABLE IF NOT EXISTS classification_cache (
      title_hash VARCHAR(64) PRIMARY KEY,
      title TEXT NOT NULL,
      is_business BOOLEAN NOT NULL,
      confidence INTEGER NOT NULL,
      matched_signals TEXT[],
      veto_reason TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `.then(() => {
    console.log("[DB] Classification cache table verified/created successfully.");
  }).catch((err) => {
    console.error("[DB] Failed to verify/create classification cache table:", err);
  });
}
