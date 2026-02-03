import { describe, it, expect, vi, beforeEach } from "vitest";

const findById = vi.hoisted(() => vi.fn());
const update = vi.hoisted(() => vi.fn());
const validateTitleUniqueness = vi.hoisted(() => vi.fn());

vi.mock("../repository/todo.repository", () => ({
  todoRepository: {
    findById,
    update,
  },
}));

vi.mock("../validators/todo.validator", () => ({
  todoValidator: {
    validateTitleUniqueness,
  },
}));

import { updateTodoHandler } from "./update-todo.command";

describe("updateTodoHandler", () => {
  const logger = {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  };

  const todoId = "c5d6e7f8-9a0b-4c1d-8e2f-3a4b5c6d7e8f";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return not found, when todo does not exist", async () => {
    findById.mockResolvedValue(undefined);

    const result = await updateTodoHandler(todoId, {}, logger);

    expect(result.isSuccess).toBe(false);
    expect(result.errors?.[0]?.code).toBe("RESOURCE_NOT_FOUND");
  });

  it("should update a todo, when input is valid", async () => {
    const existingTodo = {
      id: todoId,
      title: "Original",
      description: "",
      priority: "medium",
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updatedTodo = {
      ...existingTodo,
      title: "Updated",
      updatedAt: new Date(),
    };

    findById.mockResolvedValue(existingTodo);
    validateTitleUniqueness.mockResolvedValue({ isValid: true });
    update.mockResolvedValue(updatedTodo);

    const result = await updateTodoHandler(
      todoId,
      { title: "Updated" },
      logger,
    );

    expect(result.isSuccess).toBe(true);
    expect(result.data).toEqual(updatedTodo);
  });
});
