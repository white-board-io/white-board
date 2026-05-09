import type {
  Todo,
  CreateTodoInput,
  UpdateTodoInput,
} from "../schemas/todo.schema";
import { db, eq, desc, sql, and } from "@repo/database";
import { todos } from "@repo/database/schema/todo";
import { SQL } from "drizzle-orm";

// Utility to remove undefined keys but preserve null/false/0
// This replaces lodash.pickBy(obj, identity) which incorrectly removes falsy values
const cleanObject = (obj: Record<string, unknown>) => {
  const newObj: Record<string, unknown> = {};
  Object.keys(obj).forEach((key) => {
    if (obj[key] !== undefined) {
      newObj[key] = obj[key];
    }
  });
  return newObj;
};

export const todoRepository = {
  findAll: async (filters?: {
    completed?: boolean;
    priority?: string;
  }): Promise<Todo[]> => {
    const query = db.select().from(todos).orderBy(desc(todos.createdAt));

    const conditions: SQL[] = [];

    if (filters?.completed !== undefined) {
      conditions.push(eq(todos.completed, filters.completed));
    }

    if (filters?.priority) {
      conditions.push(
        eq(todos.priority, filters.priority as "low" | "medium" | "high"),
      );
    }

    if (conditions.length > 0) {
      query.where(and(...conditions));
    }

    const results = await query;
    return results.map(mapTodoFromDb);
  },

  findById: async (id: string): Promise<Todo | undefined> => {
    const results = await db
      .select()
      .from(todos)
      .where(eq(todos.id, id))
      .limit(1);

    return results.length > 0 ? mapTodoFromDb(results[0]) : undefined;
  },

  findByTitle: async (title: string): Promise<Todo | undefined> => {
    const results = await db
      .select()
      .from(todos)
      .where(sql`LOWER(${todos.title}) = LOWER(${title})`)
      .limit(1);

    return results.length > 0 ? mapTodoFromDb(results[0]) : undefined;
  },

  create: async (input: CreateTodoInput): Promise<Todo> => {
    const [result] = await db
      .insert(todos)
      .values({
        title: input.title,
        description: input.description ?? null,
        priority: input.priority ?? "medium",
        dueDate: input.dueDate ?? null,
      })
      .returning();

    return mapTodoFromDb(result);
  },

  update: async (
    id: string,
    input: UpdateTodoInput,
  ): Promise<Todo | undefined> => {
    const updateData = {
      ...cleanObject(input as unknown as Record<string, unknown>),
      updatedAt: new Date(),
    };

    const results = await db
      .update(todos)
      .set(updateData)
      .where(eq(todos.id, id))
      .returning();

    return results.length > 0 ? mapTodoFromDb(results[0]) : undefined;
  },

  delete: async (id: string): Promise<boolean> => {
    const results = await db
      .delete(todos)
      .where(eq(todos.id, id))
      .returning({ id: todos.id });

    return results.length > 0;
  },

  clear: async (): Promise<void> => {
    await db.delete(todos);
  },
};

function mapTodoFromDb(row: typeof todos.$inferSelect): Todo {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    priority: row.priority,
    dueDate: row.dueDate ?? undefined,
    completed: row.completed,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}
