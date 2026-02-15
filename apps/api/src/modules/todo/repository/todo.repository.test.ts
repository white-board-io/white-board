import { describe, it, expect, vi, beforeEach } from "vitest";

// Hoist mocks to use them in vi.mock factory
const { mockSelect, mockWhere, mockOrderBy, mockFrom } = vi.hoisted(() => {
  return {
    mockSelect: vi.fn(),
    mockWhere: vi.fn(),
    mockOrderBy: vi.fn(),
    mockFrom: vi.fn(),
  };
});

vi.mock("@repo/database", () => {
  return {
    db: {
      select: mockSelect,
    },
    eq: vi.fn((a, b) => ({ type: "eq", args: [a, b] })),
    desc: vi.fn((col) => ({ type: "desc", col })),
    and: vi.fn((...args) => ({ type: "and", args })),
    sql: vi.fn(),
  };
});

// Mock schema to avoid import errors
vi.mock("@repo/database/schema/todo", () => ({
  todos: {
    createdAt: "createdAt",
    completed: "completed",
    priority: "priority",
    id: "id",
    title: "title",
    description: "description",
    dueDate: "dueDate",
    updatedAt: "updatedAt",
    $inferSelect: {},
  }
}));

// Import AFTER mocks
import { todoRepository } from "./todo.repository";

describe("todoRepository.findAll", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup the fluent chain
    const mockQuery = {
      where: mockWhere,
      then: (resolve: (val: unknown[]) => void) => resolve([]),
    };

    // Chain: select().from().orderBy().where().where()...
    mockSelect.mockReturnValue({ from: mockFrom });
    mockFrom.mockReturnValue({ orderBy: mockOrderBy });
    mockOrderBy.mockReturnValue(mockQuery);
    mockWhere.mockReturnValue(mockQuery);
  });

  it("should call where once with combined conditions when multiple filters are provided", async () => {
    await todoRepository.findAll({ completed: true, priority: "high" });

    // Expect where to be called ONCE
    expect(mockWhere).toHaveBeenCalledTimes(1);

    // Verify the argument is an 'and' condition
    const callArgs = mockWhere.mock.calls[0][0];
    expect(callArgs.type).toBe("and");
    expect(callArgs.args).toHaveLength(2);

    // Check inner conditions
    const innerConditions = callArgs.args;
    expect(innerConditions[0].type).toBe("eq");
    expect(innerConditions[0].args[1]).toBe(true);

    expect(innerConditions[1].type).toBe("eq");
    expect(innerConditions[1].args[1]).toBe("high");
  });
});
