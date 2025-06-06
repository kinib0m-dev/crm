import { drizzle } from "drizzle-orm/neon-http";

// Ensure this only runs on the server
if (typeof window !== "undefined") {
  throw new Error("Database connection should only be used on the server side");
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

export const db = drizzle(process.env.DATABASE_URL);
