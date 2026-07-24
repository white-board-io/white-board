import { describe, it, expect, vi, beforeEach } from "vitest";

const remove = vi.hoisted(() => vi.fn());

vi.mock("../repository/todo.repository", () => ({
  todoRepository: {
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

  it("should return not found error, when delete returns false", async () => {
    remove.mockResolvedValue(false);

    const result = await deleteTodoHandler(todoId, logger);

    expect(result.isSuccess).toBe(false);
    expect(result.errors?.[0]?.code).toBe("RESOURCE_NOT_FOUND");
  });

  it("should delete a todo, when delete returns true", async () => {
    remove.mockResolvedValue(true);

    const result = await deleteTodoHandler(todoId, logger);

    expect(result.isSuccess).toBe(true);
    expect(result.data).toBeNull();
  });
});
