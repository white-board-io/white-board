import type { Todo } from "../schemas/todo.schema";
import { TodoIdParamSchema } from "../schemas/todo.schema";
import { todoRepository } from "../repository/todo.repository";
import type { LoggerHelpers } from "../../../plugins/logger";
import { mapZodErrors } from "@utils/mapZodErrors";
import { ServiceResult } from "@utils/ServiceResult";

export type GetTodoByIdQueryResult = {
  data: Todo;
};

export async function getTodoByIdHandler(
  id: unknown,
  logger: LoggerHelpers,
): Promise<ServiceResult<Todo>> {
  logger.debug("GetTodoByIdQuery received", { id });

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

  const todo = await todoRepository.findById(validatedId);

  if (!todo) {
    logger.warn("Todo not found", { id: validatedId });
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

  logger.debug("Todo retrieved", { todoId: validatedId });

  return {
    isSuccess: true,
    data: todo,
  };
}
