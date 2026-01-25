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

  fastify.post(
    "/",
    {
      schema: {
        tags: ["todos"],
        summary: "Create a new todo",
        description: "Creates a new todo with the provided details",
        body: {
          type: "object",
          properties: {
            title: { type: "string" },
            description: { type: ["string", "null"] },
            priority: { type: "string", enum: ["low", "medium", "high"] },
            dueDate: { type: "string", format: "date-time" },
          },
          required: ["title"],
        },
        response: {
          201: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              data: {
                type: "object",
                properties: {
                  id: { type: "string", format: "uuid" },
                  title: { type: "string" },
                  description: { type: ["string", "null"] },
                  priority: { type: "string", enum: ["low", "medium", "high"] },
                  dueDate: { type: ["string", "null"], format: "date-time" },
                  completed: { type: "boolean" },
                  createdAt: { type: "string", format: "date-time" },
                  updatedAt: { type: "string", format: "date-time" },
                },
              },
              error: {
                type: "object",
                properties: {
                  code: { type: "string" },
                  message: { type: "string" },
                  details: { type: "object" },
                },
              },
            },
          },
          400: {
            type: "object",
            properties: {
              error: {
                type: "object",
                properties: {
                  code: { type: "string" },
                  message: { type: "string" },
                  details: { type: "object" },
                },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const result = await createTodoHandler(request.body, fastify.logger);

        if (result.isSuccess) {
          return reply.status(201).send(result.data);
        } else {
          return reply.status(400).send(result.errors);
        }
      } catch (error) {
        return handleError(error, reply);
      }
    },
  );

  fastify.get(
    "/",
    {
      schema: {
        tags: ["todos"],
        summary: "Get all todos",
        description: "Retrieves a list of all todos with optional filters",
        querystring: {
          type: "object",
          properties: {
            completed: { type: "string" },
            priority: { type: "string", enum: ["low", "medium", "high"] },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              data: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string", format: "uuid" },
                    title: { type: "string" },
                    description: { type: ["string", "null"] },
                    priority: {
                      type: "string",
                      enum: ["low", "medium", "high"],
                    },
                    dueDate: { type: ["string", "null"], format: "date-time" },
                    completed: { type: "boolean" },
                    createdAt: { type: "string", format: "date-time" },
                    updatedAt: { type: "string", format: "date-time" },
                  },
                },
              },
              error: {
                type: "object",
                properties: {
                  code: { type: "string" },
                  message: { type: "string" },
                  details: { type: "object" },
                },
              },
            },
          },
          400: {
            type: "object",
            properties: {
              error: {
                type: "object",
                properties: {
                  code: { type: "string" },
                  message: { type: "string" },
                  details: { type: "object" },
                },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const result = await getAllTodosHandler(request.query, fastify.logger);
        if (result.isSuccess) {
          return reply.status(200).send(result.data);
        } else {
          return reply.status(400).send(result.errors);
        }
      } catch (error) {
        return handleError(error, reply);
      }
    },
  );

  fastify.get(
    "/:id",
    {
      schema: {
        tags: ["todos"],
        summary: "Get todo by ID",
        description: "Retrieves a single todo by its ID",
        params: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
          },
          required: ["id"],
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              data: {
                type: "object",
                properties: {
                  id: { type: "string", format: "uuid" },
                  title: { type: "string" },
                  description: { type: ["string", "null"] },
                  priority: { type: "string", enum: ["low", "medium", "high"] },
                  dueDate: { type: ["string", "null"], format: "date-time" },
                  completed: { type: "boolean" },
                  createdAt: { type: "string", format: "date-time" },
                  updatedAt: { type: "string", format: "date-time" },
                },
              },
              error: {
                type: "object",
                properties: {
                  code: { type: "string" },
                  message: { type: "string" },
                  details: { type: "object" },
                },
              },
            },
          },
          400: {
            type: "object",
            properties: {
              error: {
                type: "object",
                properties: {
                  code: { type: "string" },
                  message: { type: "string" },
                  details: { type: "object" },
                },
              },
            },
          },
          404: {
            type: "object",
            properties: {
              error: {
                type: "object",
                properties: {
                  code: { type: "string" },
                  message: { type: "string" },
                  details: { type: "object" },
                },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        const result = await getTodoByIdHandler(id, fastify.logger);
        if (result.isSuccess) {
          return reply.status(200).send(result.data);
        } else {
          return reply.status(400).send(result.errors);
        }
      } catch (error) {
        return handleError(error, reply);
      }
    },
  );

  fastify.put(
    "/:id",
    {
      schema: {
        tags: ["todos"],
        summary: "Update a todo",
        description: "Updates an existing todo with the provided details",
        params: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
          },
          required: ["id"],
        },
        body: {
          type: "object",
          properties: {
            title: { type: "string" },
            description: { type: ["string", "null"] },
            priority: { type: "string", enum: ["low", "medium", "high"] },
            dueDate: { type: ["string", "null"], format: "date-time" },
            completed: { type: "boolean" },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              data: {
                type: "object",
                properties: {
                  id: { type: "string", format: "uuid" },
                  title: { type: "string" },
                  description: { type: ["string", "null"] },
                  priority: { type: "string", enum: ["low", "medium", "high"] },
                  dueDate: { type: ["string", "null"], format: "date-time" },
                  completed: { type: "boolean" },
                  createdAt: { type: "string", format: "date-time" },
                  updatedAt: { type: "string", format: "date-time" },
                },
              },
              error: {
                type: "object",
                properties: {
                  code: { type: "string" },
                  message: { type: "string" },
                  details: { type: "object" },
                },
              },
            },
          },
          400: {
            type: "object",
            properties: {
              error: {
                type: "object",
                properties: {
                  code: { type: "string" },
                  message: { type: "string" },
                  details: { type: "object" },
                },
              },
            },
          },
          404: {
            type: "object",
            properties: {
              error: {
                type: "object",
                properties: {
                  code: { type: "string" },
                  message: { type: "string" },
                  details: { type: "object" },
                },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        const result = await updateTodoHandler(
          id,
          request.body,
          fastify.logger,
        );
        return reply.send(result);
      } catch (error) {
        return handleError(error, reply);
      }
    },
  );

  fastify.patch(
    "/:id/toggle",
    {
      schema: {
        tags: ["todos"],
        summary: "Toggle todo completion",
        description: "Toggles the completion status of a todo",
        params: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
          },
          required: ["id"],
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              data: {
                type: "object",
                properties: {
                  id: { type: "string", format: "uuid" },
                  title: { type: "string" },
                  description: { type: ["string", "null"] },
                  priority: { type: "string", enum: ["low", "medium", "high"] },
                  dueDate: { type: ["string", "null"], format: "date-time" },
                  completed: { type: "boolean" },
                  createdAt: { type: "string", format: "date-time" },
                  updatedAt: { type: "string", format: "date-time" },
                },
              },
              error: {
                type: "object",
                properties: {
                  code: { type: "string" },
                  message: { type: "string" },
                  details: { type: "object" },
                },
              },
            },
          },
          400: {
            type: "object",
            properties: {
              error: {
                type: "object",
                properties: {
                  code: { type: "string" },
                  message: { type: "string" },
                  details: { type: "object" },
                },
              },
            },
          },
          404: {
            type: "object",
            properties: {
              error: {
                type: "object",
                properties: {
                  code: { type: "string" },
                  message: { type: "string" },
                  details: { type: "object" },
                },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        const result = await toggleTodoHandler(id, fastify.logger);
        if (result.isSuccess) {
          return reply.status(200).send(result.data);
        } else {
          return reply.status(400).send(result.errors);
        }
      } catch (error) {
        return handleError(error, reply);
      }
    },
  );

  fastify.delete(
    "/:id",
    {
      schema: {
        tags: ["todos"],
        summary: "Delete a todo",
        description: "Deletes a todo by its ID",
        params: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
          },
          required: ["id"],
        },
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              data: { type: "object" },
              error: {
                type: "object",
                properties: {
                  code: { type: "string" },
                  message: { type: "string" },
                  details: { type: "object" },
                },
              },
            },
          },
          400: {
            type: "object",
            properties: {
              error: {
                type: "object",
                properties: {
                  code: { type: "string" },
                  message: { type: "string" },
                  details: { type: "object" },
                },
              },
            },
          },
          404: {
            type: "object",
            properties: {
              error: {
                type: "object",
                properties: {
                  code: { type: "string" },
                  message: { type: "string" },
                  details: { type: "object" },
                },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        const result = await deleteTodoHandler(id, fastify.logger);
        if (result.isSuccess) {
          return reply.status(200).send(null);
        } else {
          return reply.status(400).send(result.errors);
        }
      } catch (error) {
        return handleError(error, reply);
      }
    },
  );
};

export default todosRoutes;
