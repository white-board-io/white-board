import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/schema/todo.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
  },
});
