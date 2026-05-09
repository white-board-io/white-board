import { drizzle as drizzlePostgresJs } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { newDb } from "pg-mem";
import { randomUUID } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import * as todoSchema from "../schema/todo";
import * as authSchema from "../schema/auth";
import * as rolesSchema from "../schema/roles";

const schema = { ...todoSchema, ...authSchema, ...rolesSchema };

const isTest = process.env.NODE_ENV === "test";

const ensureUserIdUnique = (db: ReturnType<typeof newDb>) => {
  try {
    db.public.none(
      'ALTER TABLE "user" ADD CONSTRAINT "user_id_unique" UNIQUE ("id")',
    );
  } catch {
    // pg-mem may already have a primary/unique constraint; ignore duplicate errors.
  }
};

const loadMigrations = (db: ReturnType<typeof newDb>) => {
  const migrationsDir = join(
    dirname(fileURLToPath(import.meta.url)),
    "..",
    "..",
    "drizzle",
  );
  const files = readdirSync(migrationsDir)
    .filter((file) => file.endsWith(".sql"))
    .sort();

  for (const file of files) {
    const sqlText = readFileSync(join(migrationsDir, file), "utf8");
    const statements = sqlText
      .split("--> statement-breakpoint")
      .map((statement) => statement.trim())
      .filter(Boolean);

    for (const statement of statements) {
      try {
        db.public.none(statement);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : String(error);
        if (
          message.includes(
            'no unique constraint matching given keys for referenced table "user"',
          ) &&
          statement.includes("ADD CONSTRAINT") &&
          statement.includes('REFERENCES "user"')
        ) {
          continue;
        }
        throw error;
      }

      if (
        statement.includes(
          'ALTER TABLE "user" ALTER COLUMN "id" SET DATA TYPE text',
        )
      ) {
        ensureUserIdUnique(db);
      }
    }
  }
};

const createTestDb = () => {
  const memDb = newDb({ autoCreateForeignKeyIndices: false });
  memDb.public.registerFunction({
    name: "gen_random_uuid",
    returns: "uuid",
    implementation: randomUUID,
    impure: true,
  });
  memDb.public.registerFunction({
    name: "now",
    returns: "timestamp",
    implementation: () => new Date(),
  });

  loadMigrations(memDb);

  const require = createRequire(import.meta.url);
  const postgresModule = require("postgres");
  if (!postgresModule.default) {
    postgresModule.default = postgresModule;
  }

  const sql = memDb.adapters.createPostgresJsTag();
  return drizzlePostgresJs(sql, { schema });
};

const createProdDb = () => {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL environment variable is required. " +
        "Please set it to a valid PostgreSQL connection string.",
    );
  }

  const isDevelopment = process.env.NODE_ENV !== "production";

  const client = postgres(connectionString, {
    idle_timeout: 20,
    connect_timeout: 10,
    max: isDevelopment ? 1 : 10,
  });

  return drizzlePostgresJs(client, { schema });
};

export const db = isTest ? createTestDb() : createProdDb();

export { eq, and, or, desc, asc, sql } from "drizzle-orm";
