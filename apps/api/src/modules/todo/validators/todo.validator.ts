import { todoRepository } from "../repository/todo.repository";
import { createDuplicateError } from "../../../shared/errors/app-error";

export const todoValidator = {
  validateTitleUniqueness: async (
    title: string,
    excludeId?: string
  ): Promise<void> => {
    const existingTodo = await todoRepository.findByTitle(title);

    if (existingTodo && existingTodo.id !== excludeId) {
      throw createDuplicateError("todo", "title", title);
    }
  },

  validateDueDate: (dueDate?: Date): boolean => {
    if (!dueDate) return true;
    return dueDate > new Date();
  },
};
