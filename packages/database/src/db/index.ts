import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as todoSchema from "../schema/todo";
import * as authSchema from "../schema/auth";

const schema = { ...todoSchema, ...authSchema };

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
