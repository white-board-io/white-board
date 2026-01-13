import { z } from "zod";
import { TodoIdParamSchema } from "../schemas/todo.schema";
import { todoRepository } from "../repository/todo.repository";
import {
  createNotFoundError,
  createValidationError,
} from "../../../shared/errors/app-error";
import type { LoggerHelpers } from "../../../plugins/logger";

export type DeleteTodoCommandResult = {
  message: string;
};

export async function deleteTodoHandler(
  id: unknown,
  logger: LoggerHelpers
): Promise<DeleteTodoCommandResult> {
  logger.debug("DeleteTodoCommand received", { id });

  const parseResult = TodoIdParamSchema.safeParse({ id });
  if (!parseResult.success) {
    const errors = z.flattenError(parseResult.error);
    logger.warn("Invalid todo ID format", { id, errors });
    throw createValidationError({ fieldErrors: errors.fieldErrors });
  }

  const validatedId = parseResult.data.id;

  const existingTodo = await todoRepository.findById(validatedId);
  if (!existingTodo) {
    logger.warn("Todo not found for deletion", { id: validatedId });
    throw createNotFoundError("Todo", validatedId);
  }

  await todoRepository.delete(validatedId);

  logger.info("Todo deleted successfully", {
    todoId: validatedId,
    title: existingTodo.title,
  });

  return {
    message: `Todo '${existingTodo.title}' deleted successfully`,
  };
}
