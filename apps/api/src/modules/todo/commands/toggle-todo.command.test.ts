import { describe, it, expect, vi, beforeEach } from "vitest";

const findById = vi.hoisted(() => vi.fn());
const update = vi.hoisted(() => vi.fn());

vi.mock("../repository/todo.repository", () => ({
  todoRepository: {
    findById,
    update,
  },
}));

import { toggleTodoHandler } from "./toggle-todo.command";

describe("toggleTodoHandler", () => {
  const logger = {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  };
  const todoId = "b4c5d6e7-8f9a-4b0c-8d1e-2f3a4b5c6d7e";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return not found, when todo does not exist", async () => {
    findById.mockResolvedValue(undefined);

    const result = await toggleTodoHandler(
      todoId,
      logger,
    );

    expect(result.isSuccess).toBe(false);
    if (!result.isSuccess) {
      expect(result.errors?.[0]?.code).toBe("RESOURCE_NOT_FOUND");
    }
  });

  it("should return validation errors, when id is invalid", async () => {
    const result = await toggleTodoHandler("bad-id", logger);

    expect(result.isSuccess).toBe(false);
    if (!result.isSuccess) {
      expect(result.errors?.[0]?.code).toBe("INVALID_TODO_ID_FORMAT");
    }
  });

  it("should toggle completion, when todo exists", async () => {
    const todo = {
      id: todoId,
      title: "Toggle",
      description: "",
      priority: "medium",
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updatedTodo = { ...todo, completed: true, updatedAt: new Date() };

    findById.mockResolvedValue(todo);
    update.mockResolvedValue(updatedTodo);

    const result = await toggleTodoHandler(todo.id, logger);

    expect(result.isSuccess).toBe(true);
    if (result.isSuccess) {
      expect(result.data).toEqual(updatedTodo);
    }
  });
});
