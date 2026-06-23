import { TodoIdParamSchema } from "../schemas/todo.schema";
import { todoRepository } from "../repository/todo.repository";
import type { LoggerHelpers } from "../../../plugins/logger";
import { Todo } from "../schemas/todo.schema";
import { mapZodErrors } from "@utils/mapZodErrors";
import { ServiceResult } from "@utils/ServiceResult";

export async function toggleTodoHandler(
  id: unknown,
  logger: LoggerHelpers,
): Promise<ServiceResult<Todo>> {
  logger.debug("ToggleTodoCommand received", { id });

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

  // ⚡ Bolt: Toggled record atomically using toggle method to avoid read-modify-write pattern
  const updatedTodo = await todoRepository.toggle(validatedId);
  if (!updatedTodo) {
    logger.warn("Todo not found for toggle", { id: validatedId });
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

  logger.info("Todo status toggled", {
    todoId: validatedId,
    title: updatedTodo.title,
    completed: updatedTodo.completed,
  });

  return {
    data: updatedTodo,
    isSuccess: true,
  };
}
