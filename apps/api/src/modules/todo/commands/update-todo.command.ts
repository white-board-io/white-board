import {
  UpdateTodoInputSchema,
  TodoIdParamSchema,
  type UpdateTodoInput,
  type Todo,
} from "../schemas/todo.schema";
import { todoRepository } from "../repository/todo.repository";
import { todoValidator } from "../validators/todo.validator";
import type { LoggerHelpers } from "../../../plugins/logger";
import { mapZodErrors } from "@utils/mapZodErrors";
import { ServiceResult } from "../../../utils/ServiceResult";

export async function updateTodoHandler(
  id: unknown,
  input: unknown,
  logger: LoggerHelpers,
): Promise<ServiceResult<Todo>> {
  logger.debug("UpdateTodoCommand received", { id, input });

  const idParseResult = TodoIdParamSchema.safeParse({ id });
  if (!idParseResult.success) {
    const errors = mapZodErrors(idParseResult.error);
    logger.warn("Invalid todo ID format", { id, errors });
    return {
      errors,
      isSuccess: false,
    };
  }

  const validatedId = idParseResult.data.id;

  const existingTodo = await todoRepository.findById(validatedId);
  if (!existingTodo) {
    logger.warn("Todo not found for update", { id: validatedId });
    return {
      errors: [
        {
          code: "RESOURCE_NOT_FOUND",
          message: "Todo not found",
        },
      ],
      isSuccess: false,
    };
  }

  const parseResult = UpdateTodoInputSchema.safeParse(input);
  if (!parseResult.success) {
    const errors = mapZodErrors(parseResult.error);
    logger.warn("Validation failed for UpdateTodoCommand", { errors });
    return {
      errors,
      isSuccess: false,
    };
  }

  const validatedInput: UpdateTodoInput = parseResult.data;

  if (validatedInput.title) {
    await todoValidator.validateTitleUniqueness(
      validatedInput.title,
      validatedId,
    );
  }

  const updatedTodo = await todoRepository.update(validatedId, validatedInput);
  if (!updatedTodo) {
    return {
      errors: [
        {
          code: "RESOURCE_NOT_FOUND",
          message: "Todo not found",
        },
      ],
      isSuccess: false,
    };
  }

  logger.info("Todo updated successfully", { todoId: validatedId });

  return {
    isSuccess: true,
    data: updatedTodo,
  };
}
