import { describe, it, expect, vi, beforeEach } from "vitest";

// Use vi.hoisted to ensure mocks are available before imports
const { mockSelect, mockWhere, mockOrderBy, mockFrom, mockEq, mockAnd } = vi.hoisted(() => {
  const mockWhere = vi.fn();
  const mockOrderBy = vi.fn();

  // Need to return this for chaining
  mockWhere.mockReturnValue({ where: mockWhere });
  mockOrderBy.mockReturnValue({ where: mockWhere }); // .orderBy().where()

  const mockFrom = vi.fn().mockReturnValue({
    orderBy: mockOrderBy,
    where: mockWhere,
    then: (resolve: (val: unknown) => void) => resolve([]),
  });

  const mockSelect = vi.fn().mockReturnValue({
    from: mockFrom,
  });

  return {
    mockSelect,
    mockWhere,
    mockOrderBy,
    mockFrom,
    mockEq: vi.fn().mockReturnValue({ type: "eq" }),
    mockAnd: vi.fn().mockReturnValue({ type: "and" })
  };
});

// Mock @repo/database
vi.mock("@repo/database", () => {
  return {
    db: {
      select: mockSelect,
      insert: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    eq: mockEq,
    and: mockAnd,
    desc: vi.fn().mockReturnValue({ type: "desc" }),
    sql: vi.fn().mockReturnValue({ type: "sql" }),
  };
});

// Mock schema
vi.mock("@repo/database/schema/todo", () => ({
  todos: {
    id: "id",
    title: "title",
    completed: "completed",
    priority: "priority",
    createdAt: "createdAt",
  },
}));

// Import after mocking
import { todoRepository } from "./todo.repository";

describe("todoRepository.findAll", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Reset mock return values to support chaining
    const queryBuilder = {
        orderBy: mockOrderBy,
        where: mockWhere,
        then: (resolve: (val: unknown) => void) => resolve([]),
    };

    mockSelect.mockReturnValue({ from: mockFrom });
    mockFrom.mockReturnValue(queryBuilder);
    mockOrderBy.mockReturnValue(queryBuilder);
    mockWhere.mockReturnValue(queryBuilder);
  });

  it("should combine multiple filters using AND logic (call where once)", async () => {
    // When calling with both filters
    await todoRepository.findAll({ completed: true, priority: "high" });

    // Current buggy implementation calls where() twice:
    // 1. where(completed)
    // 2. where(priority)
    // This typically overwrites the first condition in many query builders or is inefficient.
    // Ideally we want one where() call with AND.

    expect(mockWhere).toHaveBeenCalledTimes(1);
  });
});
