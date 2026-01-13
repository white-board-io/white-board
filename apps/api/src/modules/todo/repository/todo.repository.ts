import type {
  Todo,
  CreateTodoInput,
  UpdateTodoInput,
} from "../schemas/todo.schema";
import { v4 as uuidv4 } from "uuid";

/**
 * In-memory storage for todos
 *
 * TODO: Replace with Drizzle ORM when database is configured
 * This will be replaced with:
 *   import { db } from '@/db';
 *   import { todos } from '@/db/schema';
 */
const todoStore = new Map<string, Todo>();

/**
 * Todo Repository - Data access layer
 *
 * This repository handles all data operations for todos.
 * Currently uses in-memory Map storage, designed to be easily
 * replaced with Drizzle ORM calls.
 */
export const todoRepository = {
  /**
   * Find all todos with optional filtering
   *
   * TODO: Replace with Drizzle:
   *   const results = await db.select().from(todos).where(conditions);
   */
  findAll: async (filters?: {
    completed?: boolean;
    priority?: string;
  }): Promise<Todo[]> => {
    let todos = Array.from(todoStore.values());

    if (filters?.completed !== undefined) {
      todos = todos.filter((todo) => todo.completed === filters.completed);
    }

    if (filters?.priority) {
      todos = todos.filter((todo) => todo.priority === filters.priority);
    }

    // Sort by createdAt descending (newest first)
    return todos.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  },

  /**
   * Find a single todo by ID
   *
   * TODO: Replace with Drizzle:
   *   const result = await db.select().from(todos).where(eq(todos.id, id)).limit(1);
   */
  findById: async (id: string): Promise<Todo | undefined> => {
    return todoStore.get(id);
  },

  /**
   * Find a todo by title (for duplicate checking)
   *
   * TODO: Replace with Drizzle:
   *   const result = await db.select().from(todos).where(eq(todos.title, title)).limit(1);
   */
  findByTitle: async (title: string): Promise<Todo | undefined> => {
    return Array.from(todoStore.values()).find(
      (todo) => todo.title.toLowerCase() === title.toLowerCase()
    );
  },

  /**
   * Create a new todo
   *
   * TODO: Replace with Drizzle:
   *   const [result] = await db.insert(todos).values(data).returning();
   */
  create: async (input: CreateTodoInput): Promise<Todo> => {
    const now = new Date();
    const todo: Todo = {
      id: uuidv4(),
      title: input.title,
      description: input.description,
      priority: input.priority ?? "medium",
      dueDate: input.dueDate,
      completed: false,
      createdAt: now,
      updatedAt: now,
    };

    todoStore.set(todo.id, todo);
    return todo;
  },

  /**
   * Update an existing todo
   *
   * TODO: Replace with Drizzle:
   *   const [result] = await db.update(todos).set(data).where(eq(todos.id, id)).returning();
   */
  update: async (
    id: string,
    input: UpdateTodoInput
  ): Promise<Todo | undefined> => {
    const existing = todoStore.get(id);
    if (!existing) {
      return undefined;
    }

    const updated: Todo = {
      ...existing,
      ...(input.title !== undefined && { title: input.title }),
      ...(input.description !== undefined && {
        description: input.description,
      }),
      ...(input.priority !== undefined && { priority: input.priority }),
      ...(input.dueDate !== undefined && {
        dueDate: input.dueDate ?? undefined,
      }),
      ...(input.completed !== undefined && { completed: input.completed }),
      updatedAt: new Date(),
    };

    todoStore.set(id, updated);
    return updated;
  },

  /**
   * Delete a todo by ID
   *
   * TODO: Replace with Drizzle:
   *   await db.delete(todos).where(eq(todos.id, id));
   */
  delete: async (id: string): Promise<boolean> => {
    return todoStore.delete(id);
  },

  /**
   * Clear all todos (useful for testing)
   *
   * TODO: Replace with Drizzle:
   *   await db.delete(todos);
   */
  clear: async (): Promise<void> => {
    todoStore.clear();
  },
};
