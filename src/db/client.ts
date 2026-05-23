import { neon } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "@/db/schema";

let db: NeonHttpDatabase<typeof schema> | null = null;

export function getDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required for the shared review preview.");
  }

  if (!db) {
    db = drizzle(neon(process.env.DATABASE_URL), { schema });
  }

  return db;
}
