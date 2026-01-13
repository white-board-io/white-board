import { z } from "zod";
import {
  UpdateTodoInputSchema,
  TodoIdParamSchema,
  type UpdateTodoInput,
  type Todo,
} from "../schemas/todo.schema";
import { todoRepository } from "../repository/todo.repository";
import { todoValidator } from "../validators/todo.validator";
import {
  createValidationError,
  createNotFoundError,
} from "../../../shared/errors/app-error";
import type { LoggerHelpers } from "../../../plugins/logger";

export type UpdateTodoCommandResult = {
  data: Todo;
};

export async function updateTodoHandler(
  id: unknown,
  input: unknown,
  logger: LoggerHelpers
): Promise<UpdateTodoCommandResult> {
  logger.debug("UpdateTodoCommand received", { id, input });

  const idParseResult = TodoIdParamSchema.safeParse({ id });
  if (!idParseResult.success) {
    const errors = z.flattenError(idParseResult.error);
    logger.warn("Invalid todo ID format", { id, errors });
    throw createValidationError({ fieldErrors: errors.fieldErrors });
  }

  const validatedId = idParseResult.data.id;

  const existingTodo = await todoRepository.findById(validatedId);
  if (!existingTodo) {
    logger.warn("Todo not found for update", { id: validatedId });
    throw createNotFoundError("Todo", validatedId);
  }

  const parseResult = UpdateTodoInputSchema.safeParse(input);
  if (!parseResult.success) {
    const errors = z.flattenError(parseResult.error);
    logger.warn("Validation failed for UpdateTodoCommand", { errors });
    throw createValidationError({ fieldErrors: errors.fieldErrors });
  }

  const validatedInput: UpdateTodoInput = parseResult.data;

  if (validatedInput.title) {
    await todoValidator.validateTitleUniqueness(
      validatedInput.title,
      validatedId
    );
  }

  const updatedTodo = await todoRepository.update(validatedId, validatedInput);
  if (!updatedTodo) {
    throw createNotFoundError("Todo", validatedId);
  }

  logger.info("Todo updated successfully", { todoId: validatedId });

  return {
    data: updatedTodo,
  };
}
