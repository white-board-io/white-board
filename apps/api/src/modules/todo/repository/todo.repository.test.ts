import { describe, it, expect, vi, beforeEach } from "vitest";

// Use vi.hoisted for variables used in vi.mock
const mocks = vi.hoisted(() => ({
  select: vi.fn(),
  from: vi.fn(),
  orderBy: vi.fn(),
  where: vi.fn(),
  eq: vi.fn(),
  desc: vi.fn(),
  and: vi.fn(),
  sql: vi.fn(),
  insert: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
}));

vi.mock("@repo/database", () => ({
  db: {
    select: mocks.select,
    insert: mocks.insert,
    update: mocks.update,
    delete: mocks.delete,
  },
  eq: mocks.eq,
  desc: mocks.desc,
  and: mocks.and,
  sql: mocks.sql,
}));

import { todoRepository } from "./todo.repository";

describe("todoRepository.findAll", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    const mockThenable = {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      then: (resolve: any) => resolve([]),
      where: mocks.where,
    };

    mocks.select.mockReturnValue({ from: mocks.from });
    mocks.from.mockReturnValue({ orderBy: mocks.orderBy });
    mocks.orderBy.mockReturnValue(mockThenable);
    mocks.where.mockReturnValue(mockThenable);
  });

  it("should combine filters using AND when multiple filters are provided", async () => {
    const filters = { completed: true, priority: "high" };

    await todoRepository.findAll(filters);

    expect(mocks.where).toHaveBeenCalledTimes(1);
    expect(mocks.and).toHaveBeenCalled();
  });
});
