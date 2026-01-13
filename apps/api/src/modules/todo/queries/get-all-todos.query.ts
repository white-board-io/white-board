import type { Todo } from "../schemas/todo.schema";
import { ListTodosQuerySchema } from "../schemas/todo.schema";
import { todoRepository } from "../repository/todo.repository";
import type { LoggerHelpers } from "../../../plugins/logger";

export type GetAllTodosQueryResult = {
  data: Todo[];
};

export async function getAllTodosHandler(
  queryParams: unknown,
  logger: LoggerHelpers
): Promise<GetAllTodosQueryResult> {
  logger.debug("GetAllTodosQuery received", { queryParams });

  const parseResult = ListTodosQuerySchema.safeParse(queryParams ?? {});
  const filters = parseResult.success
    ? parseResult.data
    : { completed: undefined, priority: undefined };
  const todos = await todoRepository.findAll({
    completed: filters.completed,
    priority: filters.priority,
  });

  logger.info("Todos retrieved", { count: todos.length, filters });

  return {
    data: todos,
  };
}
