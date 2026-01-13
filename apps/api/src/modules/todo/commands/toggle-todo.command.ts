import { z } from "zod";
import type { Todo } from "../schemas/todo.schema";
import { TodoIdParamSchema } from "../schemas/todo.schema";
import { todoRepository } from "../repository/todo.repository";
import {
  createNotFoundError,
  createValidationError,
} from "../../../shared/errors/app-error";
import type { LoggerHelpers } from "../../../plugins/logger";

export type ToggleTodoCommandResult = {
  data: Todo;
};

export async function toggleTodoHandler(
  id: unknown,
  logger: LoggerHelpers
): Promise<ToggleTodoCommandResult> {
  logger.debug("ToggleTodoCommand received", { id });

  const parseResult = TodoIdParamSchema.safeParse({ id });
  if (!parseResult.success) {
    const errors = z.flattenError(parseResult.error);
    logger.warn("Invalid todo ID format", { id, errors });
    throw createValidationError({ fieldErrors: errors.fieldErrors });
  }

  const validatedId = parseResult.data.id;

  const existingTodo = await todoRepository.findById(validatedId);
  if (!existingTodo) {
    logger.warn("Todo not found for toggle", { id: validatedId });
    throw createNotFoundError("Todo", validatedId);
  }

  const newCompletedStatus = !existingTodo.completed;
  const updatedTodo = await todoRepository.update(validatedId, {
    completed: newCompletedStatus,
  });

  if (!updatedTodo) {
    throw createNotFoundError("Todo", validatedId);
  }

  logger.info("Todo status toggled", {
    todoId: validatedId,
    title: existingTodo.title,
    completed: newCompletedStatus,
  });

  return {
    data: updatedTodo,
  };
}
