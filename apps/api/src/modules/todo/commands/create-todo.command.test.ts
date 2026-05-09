import { describe, it, expect, vi, beforeEach } from "vitest";

const create = vi.hoisted(() => vi.fn());
const validateTitleUniqueness = vi.hoisted(() => vi.fn());

vi.mock("../repository/todo.repository", () => ({
  todoRepository: {
    create,
  },
}));

vi.mock("../validators/todo.validator", () => ({
  todoValidator: {
    validateTitleUniqueness,
  },
}));

import { createTodoHandler } from "./create-todo.command";

describe("createTodoHandler", () => {
  const logger = {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return validation errors, when input is invalid", async () => {
    const result = await createTodoHandler({}, logger);

    expect(result.isSuccess).toBe(false);
    if (!result.isSuccess) {
      expect(result.errors?.length).toBeGreaterThan(0);
    }
  });

  it("should return validation errors, when title is too long", async () => {
    const longTitle = "a".repeat(201);
    const result = await createTodoHandler({ title: longTitle }, logger);

    expect(result.isSuccess).toBe(false);
    if (!result.isSuccess) {
      expect(result.errors?.[0]?.code).toBe("TITLE_FIELD_MAX_LENGTH");
    }
  });

  it("should create a todo, when input is valid", async () => {
    const todo = {
      id: "11111111-1111-1111-1111-111111111111",
      title: "Write tests",
      description: "Add unit tests",
      priority: "medium",
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    validateTitleUniqueness.mockResolvedValue({ isValid: true });
    create.mockResolvedValue(todo);

    const result = await createTodoHandler(
      { title: "Write tests", description: "Add unit tests" },
      logger,
    );

    expect(result.isSuccess).toBe(true);
    if (result.isSuccess) {
      expect(result.data).toEqual(todo);
    }
  });
});
