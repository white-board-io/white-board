import { describe, it, expect, vi, beforeEach } from "vitest";

const findById = vi.hoisted(() => vi.fn());
const remove = vi.hoisted(() => vi.fn());

vi.mock("../repository/todo.repository", () => ({
  todoRepository: {
    findById,
    delete: remove,
  },
}));

import { deleteTodoHandler } from "./delete-todo.command";

describe("deleteTodoHandler", () => {
  const logger = {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  };
  const todoId = "a3b4c5d6-7e8f-4a9b-8c7d-6e5f4a3b2c1d";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return validation errors, when id is invalid", async () => {
    const result = await deleteTodoHandler("bad-id", logger);

    expect(result.isSuccess).toBe(false);
    expect(result.errors?.length).toBeGreaterThan(0);
  });

  it("should delete a todo, when todo exists", async () => {
    const todo = {
      id: todoId,
      title: "To delete",
      description: "",
      priority: "low",
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    findById.mockResolvedValue(todo);
    remove.mockResolvedValue(true);

    const result = await deleteTodoHandler(todo.id, logger);

    expect(result.isSuccess).toBe(true);
    expect(result.data).toBeNull();
  });
});
