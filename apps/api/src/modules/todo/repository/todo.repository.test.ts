import { describe, it, expect, vi, beforeEach } from 'vitest';
import { todoRepository } from './todo.repository';
import { and } from '@repo/database';

// Mock dependencies
vi.mock('@repo/database', () => {
  const mockQuery = {
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    then: vi.fn((resolve) => resolve([
      {
        id: '1',
        title: 'Test Todo',
        description: 'Test Description',
        priority: 'high',
        completed: true,
        dueDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ])), // mock await returning a mock todo
  };

  const mockDb = {
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue(mockQuery),
    }),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    returning: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
  };

  return {
    db: mockDb,
    eq: vi.fn(),
    desc: vi.fn(),
    and: vi.fn(),
    sql: vi.fn(),
  };
});

// Mock todos schema separately because it's imported separately
vi.mock('@repo/database/schema/todo', () => ({
  todos: {
    id: 'id',
    title: 'title',
    completed: 'completed',
    priority: 'priority',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    description: 'description',
    dueDate: 'dueDate',
    $inferSelect: {},
  },
}));

describe('todoRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('findAll', () => {
    it('should combine filters with AND instead of overwriting WHERE clause when multiple filters are provided', async () => {
      // Act
      await todoRepository.findAll({ completed: true, priority: 'high' });

      // Assert
      // Access the mock query object from the implementation
      // Since we mocked db.select().from(), we need to inspect what was returned.
      // But we can inspect if `and` was called.

      expect(and).toHaveBeenCalled();
      // If the bug exists (current implementation), `and` is NOT called, and `where` is called multiple times.
    });

  });
});
