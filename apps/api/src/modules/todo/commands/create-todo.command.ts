import { z } from "zod";
import {
  CreateTodoInputSchema,
  type CreateTodoInput,
  type Todo,
} from "../schemas/todo.schema";
import { todoRepository } from "../repository/todo.repository";
import { todoValidator } from "../validators/todo.validator";
import { createValidationError } from "../../../shared/errors/app-error";
import type { LoggerHelpers } from "../../../plugins/logger";

export type CreateTodoCommandResult = {
  data: Todo;
};

export async function createTodoHandler(
  input: unknown,
  logger: LoggerHelpers
): Promise<CreateTodoCommandResult> {
  logger.debug("CreateTodoCommand received", { input });

  const parseResult = CreateTodoInputSchema.safeParse(input);
  if (!parseResult.success) {
    const errors = z.flattenError(parseResult.error);
    logger.warn("Validation failed for CreateTodoCommand", { errors });
    throw createValidationError({ fieldErrors: errors.fieldErrors });
  }

  const validatedInput: CreateTodoInput = parseResult.data;

  await todoValidator.validateTitleUniqueness(validatedInput.title);

  const todo = await todoRepository.create(validatedInput);

  logger.info("Todo created successfully", {
    todoId: todo.id,
    title: todo.title,
  });

  return {
    data: todo,
  };
}
