import { todoRepository } from "../repository/todo.repository";
import { createDuplicateError } from "../../../shared/errors/app-error";

/**
 * Business validation layer for todos
 *
 * Contains validation logic that goes beyond schema validation,
 * such as checking for duplicate titles or other business rules.
 */
export const todoValidator = {
  /**
   * Validates that a todo title is unique
   *
   * @param title - The title to check
   * @param excludeId - Optional ID to exclude from the check (for updates)
   * @throws AppError with DUPLICATE_ERROR code if title already exists
   */
  validateTitleUniqueness: async (
    title: string,
    excludeId?: string
  ): Promise<void> => {
    const existingTodo = await todoRepository.findByTitle(title);

    if (existingTodo && existingTodo.id !== excludeId) {
      throw createDuplicateError("todo", "title", title);
    }
  },

  /**
   * Validates that a due date is in the future
   *
   * @param dueDate - The due date to validate
   * @returns true if valid, false otherwise
   */
  validateDueDate: (dueDate?: Date): boolean => {
    if (!dueDate) return true;
    return dueDate > new Date();
  },
};
