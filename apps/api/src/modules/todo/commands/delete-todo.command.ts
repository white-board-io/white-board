import { TodoIdParamSchema } from "../schemas/todo.schema";
import { todoRepository } from "../repository/todo.repository";
import type { LoggerHelpers } from "../../../plugins/logger";
import { ServiceResult } from "../../../utils/ServiceResult.ts";
import { mapZodErrors } from "@utils/mapZodErrors";

export type DeleteTodoCommandResult = {
  message: string;
};

export async function deleteTodoHandler(
  id: unknown,
  logger: LoggerHelpers,
): Promise<ServiceResult<null>> {
  logger.debug("DeleteTodoCommand received", { id });

  const parseResult = TodoIdParamSchema.safeParse({ id });
  if (!parseResult.success) {
    const errors = mapZodErrors(parseResult.error);
    logger.warn("Invalid todo ID format", { id, errors });

    return {
      errors,
      isSuccess: false,
    };
  }

  const validatedId = parseResult.data.id;

  const existingTodo = await todoRepository.findById(validatedId);
  if (!existingTodo) {
    logger.warn("Todo not found for deletion", { id: validatedId });

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

  await todoRepository.delete(validatedId);

  logger.info("Todo deleted successfully", {
    todoId: validatedId,
    title: existingTodo.title,
  });

  return {
    data: null,
    isSuccess: true,
  };
}
