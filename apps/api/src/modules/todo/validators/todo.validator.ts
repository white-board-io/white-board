import { todoRepository } from "../repository/todo.repository";
import type { ValidationResult } from "@utils/ValidationResult";

export const todoValidator = {
  validateTitleUniqueness: async (
    title: string,
    excludeId?: string,
  ): Promise<ValidationResult> => {
    const existingTodo = await todoRepository.findByTitle(title);

    if (existingTodo && existingTodo.id !== excludeId) {
      return {
        isValid: false,
        errors: [
          {
            value: title,
            code: "DUPLICATE_TITLE",
            message: "Title already exists",
          },
        ],
      };
    }

    return {
      isValid: true,
    };
  },
};
