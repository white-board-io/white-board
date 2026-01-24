import { sql } from "drizzle-orm";
import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";

export const priorityEnum = pgEnum("priority", ["low", "medium", "high"]);

export const todos = pgTable(
  "todos",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: varchar("title", { length: 200 }).notNull(),
    description: text("description"),
    priority: priorityEnum("priority").default("medium").notNull(),
    dueDate: timestamp("due_date", { mode: "date" }),
    completed: boolean("completed").default(false).notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    // Optimizes default sorting by creation date
    index("todos_created_at_idx").on(table.createdAt),
    // Optimizes filtering by completion status combined with sorting
    index("todos_completed_created_at_idx").on(
      table.completed,
      table.createdAt
    ),
    // Optimizes filtering by priority combined with sorting
    index("todos_priority_created_at_idx").on(table.priority, table.createdAt),
    // Optimizes case-insensitive title search
    index("todos_title_lower_idx").on(sql`lower(${table.title})`),
  ]
);

export type TodoEntity = typeof todos.$inferSelect;
export type NewTodoEntity = typeof todos.$inferInsert;
