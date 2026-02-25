import { describe, it, expect, vi, beforeEach } from 'vitest';

// 1. Hoist the mocks
const {
  mockWhere,
  mockFrom,
  mockSelect,
  mockOrderBy,
  mockEq,
  mockDesc,
  mockAnd,
  mockSql
} = vi.hoisted(() => {
  const mockWhere = vi.fn();
  const mockOrderBy = vi.fn();
  const mockFrom = vi.fn();
  const mockSelect = vi.fn();

  return {
    mockWhere,
    mockFrom,
    mockSelect,
    mockOrderBy,
    mockEq: vi.fn(),
    mockDesc: vi.fn(),
    mockAnd: vi.fn(),
    mockSql: vi.fn()
  };
});

// 2. Mock the database module
vi.mock('@repo/database', () => {
  return {
    db: {
      select: mockSelect,
    },
    eq: mockEq,
    desc: mockDesc,
    and: mockAnd,
    sql: mockSql,
  };
});

// 3. Mock the schema module
vi.mock('@repo/database/schema/todo', () => ({
  todos: {
    id: 'id',
    title: 'title',
    description: 'description',
    priority: 'priority',
    dueDate: 'dueDate',
    completed: 'completed',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    $inferSelect: {},
  }
}));

// Import the repository
import { todoRepository } from './todo.repository';

describe('todoRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup the query builder chain
    const mockQueryBuilder = {
        where: mockWhere,
        orderBy: mockOrderBy,
        then: (resolve: any) => resolve([]) // Make it awaitable
    };

    // Chaining
    mockWhere.mockReturnValue(mockQueryBuilder);
    mockOrderBy.mockReturnValue(mockQueryBuilder);
    mockFrom.mockReturnValue(mockQueryBuilder);
    mockSelect.mockReturnValue({ from: mockFrom });
  });

  describe('findAll', () => {
    it('should combine multiple filters with AND', async () => {
      // Act
      await todoRepository.findAll({ completed: true, priority: 'high' });

      // Assert
      expect(mockAnd).toHaveBeenCalled();
      // where() should be called once with the result of and()
      expect(mockWhere).toHaveBeenCalledTimes(1);
    });
  });
});
