import { z } from "zod";
import type { Todo } from "../schemas/todo.schema";
import { TodoIdParamSchema } from "../schemas/todo.schema";
import { todoRepository } from "../repository/todo.repository";
import {
  createNotFoundError,
  createValidationError,
} from "../../../shared/errors/app-error";
import type { LoggerHelpers } from "../../../plugins/logger";

export type GetTodoByIdQueryResult = {
  data: Todo;
};

export async function getTodoByIdHandler(
  id: unknown,
  logger: LoggerHelpers
): Promise<GetTodoByIdQueryResult> {
  logger.debug("GetTodoByIdQuery received", { id });

  const parseResult = TodoIdParamSchema.safeParse({ id });
  if (!parseResult.success) {
    const errors = z.flattenError(parseResult.error);
    logger.warn("Invalid todo ID format", { id, errors });
    throw createValidationError({ fieldErrors: errors.fieldErrors });
  }

  const validatedId = parseResult.data.id;

  const todo = await todoRepository.findById(validatedId);

  if (!todo) {
    logger.warn("Todo not found", { id: validatedId });
    throw createNotFoundError("Todo", validatedId);
  }

  logger.debug("Todo retrieved", { todoId: validatedId });

  return {
    data: todo,
  };
}
