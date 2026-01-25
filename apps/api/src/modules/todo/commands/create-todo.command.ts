import {
  CreateTodoInputSchema,
  type CreateTodoInput,
  type Todo,
} from "../schemas/todo.schema";
import { todoRepository } from "../repository/todo.repository";
import { todoValidator } from "../validators/todo.validator";
import type { LoggerHelpers } from "../../../plugins/logger";
import { ServiceResult } from "@utils/ServiceResult";
import { mapZodErrors } from "@utils/mapZodErrors";

export async function createTodoHandler(
  input: unknown,
  logger: LoggerHelpers,
): Promise<ServiceResult<Todo>> {
  logger.debug("CreateTodoCommand received", { input });

  const parseResult = CreateTodoInputSchema.safeParse(input);
  if (!parseResult.success) {
    const errors = mapZodErrors(parseResult.error);

    logger.warn("Validation failed for CreateTodoCommand", { errors });

    return {
      errors,
      isSuccess: false,
    };
  }

  const validatedInput: CreateTodoInput = parseResult.data;

  const validationResult = await todoValidator.validateTitleUniqueness(
    validatedInput.title,
  );

  if (!validationResult.isValid) {
    return {
      isSuccess: false,
      errors: validationResult.errors,
    };
  }

  const todo = await todoRepository.create(validatedInput);

  logger.info("Todo created successfully", {
    todoId: todo.id,
    title: todo.title,
  });

  return {
    data: todo,
    isSuccess: true,
  };
}
