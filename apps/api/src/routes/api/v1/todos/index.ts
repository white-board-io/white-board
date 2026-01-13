import { FastifyPluginAsync } from "fastify";
import { createTodoHandler } from "../../../../modules/todo/commands/create-todo.command";
import { updateTodoHandler } from "../../../../modules/todo/commands/update-todo.command";
import { deleteTodoHandler } from "../../../../modules/todo/commands/delete-todo.command";
import { toggleTodoHandler } from "../../../../modules/todo/commands/toggle-todo.command";
import { getAllTodosHandler } from "../../../../modules/todo/queries/get-all-todos.query";
import { getTodoByIdHandler } from "../../../../modules/todo/queries/get-todo-by-id.query";
import { createErrorHandler } from "../../../../shared/utils/error-handler";

const todosRoutes: FastifyPluginAsync = async (fastify): Promise<void> => {
  const handleError = createErrorHandler(fastify);

  fastify.post("/", async (request, reply) => {
    try {
      const result = await createTodoHandler(request.body, fastify.logger);
      return reply.status(201).send(result);
    } catch (error) {
      return handleError(error, reply);
    }
  });

  fastify.get("/", async (request, reply) => {
    try {
      const result = await getAllTodosHandler(request.query, fastify.logger);
      return reply.send(result);
    } catch (error) {
      return handleError(error, reply);
    }
  });

  fastify.get("/:id", async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const result = await getTodoByIdHandler(id, fastify.logger);
      return reply.send(result);
    } catch (error) {
      return handleError(error, reply);
    }
  });

  fastify.put("/:id", async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const result = await updateTodoHandler(id, request.body, fastify.logger);
      return reply.send(result);
    } catch (error) {
      return handleError(error, reply);
    }
  });

  fastify.delete("/:id", async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const result = await deleteTodoHandler(id, fastify.logger);
      return reply.send(result);
    } catch (error) {
      return handleError(error, reply);
    }
  });

  fastify.patch("/:id/toggle", async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const result = await toggleTodoHandler(id, fastify.logger);
      return reply.send(result);
    } catch (error) {
      return handleError(error, reply);
    }
  });
};

export default todosRoutes;
