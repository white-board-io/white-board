import { describe, it, expect, vi, beforeEach } from 'vitest';
import { todoRepository } from './todo.repository';

// Hoist mocks
const {
  mockWhere,
  mockEq,
  mockAnd,
  mockDb
} = vi.hoisted(() => {
  const mockWhere = vi.fn();
  const mockOrderBy = vi.fn();
  // Chainable query builder mock
  const mockQueryBuilder = {
    where: mockWhere,
    orderBy: mockOrderBy,
    then: (resolve: any) => resolve([]), // Mock promise resolution
  };

  mockWhere.mockReturnValue(mockQueryBuilder);
  mockOrderBy.mockReturnValue(mockQueryBuilder);

  const mockFrom = vi.fn().mockReturnValue(mockQueryBuilder);
  const mockSelect = vi.fn().mockReturnValue({ from: mockFrom });
  const mockDb = { select: mockSelect };

  const mockEq = vi.fn().mockImplementation((a, b) => ({ operator: 'eq', args: [a, b] }));
  const mockDesc = vi.fn();
  const mockAnd = vi.fn().mockImplementation((...args) => ({ operator: 'and', args }));

  return {
    mockWhere,
    mockFrom,
    mockSelect,
    mockOrderBy,
    mockEq,
    mockDesc,
    mockAnd,
    mockDb
  };
});

vi.mock('@repo/database', () => {
  return {
    db: mockDb,
    eq: mockEq,
    desc: vi.fn(),
    and: mockAnd,
    sql: vi.fn(),
  };
});

// Mock the schema
vi.mock('@repo/database/schema/todo', () => ({
  todos: {
    createdAt: 'createdAt',
    completed: 'completed',
    priority: 'priority',
    id: 'id',
    title: 'title',
    $inferSelect: {}
  }
}));

describe('todoRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('findAll', () => {
    it('should use and() to combine filters', async () => {
      // Act
      await todoRepository.findAll({ completed: true, priority: 'high' });

      // Assert
      // We expect 'and' to be called to combine the filters
      expect(mockAnd).toHaveBeenCalled();

      // Also verify that eq was called for both filters
      expect(mockEq).toHaveBeenCalledWith('completed', true);
      expect(mockEq).toHaveBeenCalledWith('priority', 'high');
    });

    it('should correctly apply single filter', async () => {
        await todoRepository.findAll({ completed: true });
        expect(mockEq).toHaveBeenCalledWith('completed', true);
        // Ensure where is called
        expect(mockWhere).toHaveBeenCalled();
    });
  });
});
