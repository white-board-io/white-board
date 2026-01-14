import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../schema/todo.js";

/**
 * Database connection instance
 *
 * Uses DATABASE_URL environment variable for connection.
 * The connection is lazily initialized on first use.
 */
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL environment variable is required. " +
      "Please set it to a valid PostgreSQL connection string."
  );
}

const isDevelopment = process.env.NODE_ENV !== "production";

const client = postgres(connectionString, {
  idle_timeout: 20,
  connect_timeout: 10,
  max: isDevelopment ? 1 : 10,
});

export const db = drizzle(client, { schema });

export { eq, and, or, desc, asc, sql } from "drizzle-orm";
