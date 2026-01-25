import { FastifyPluginAsync } from "fastify";
import { createRoleHandler } from "../../../../modules/auth/commands/create-role.command";
import { updateRolePermissionsHandler } from "../../../../modules/auth/commands/update-role-permissions.command";
import { deleteRoleHandler } from "../../../../modules/auth/commands/delete-role.command";
import { listRolesHandler } from "../../../../modules/auth/queries/list-roles.query";
import { createErrorHandler } from "../../../../shared/utils/error-handler";
import { requireAuth } from "../../../../modules/auth/middleware/require-auth.middleware";

const rolesRoutes: FastifyPluginAsync = async (fastify) => {
  const handleError = createErrorHandler(fastify);

  fastify.addHook("preHandler", async (request) => {
    await requireAuth(request);
  });

  fastify.post("/", {
    schema: {
      tags: ["roles"],
      summary: "Create a new role",
      description: "Creates a new role with the provided permissions",
      security: [{ bearerAuth: [] }],
      params: {
        type: "object",
        properties: {
          organizationId: { type: "string", format: "uuid" },
        },
        required: ["organizationId"],
      },
      body: {
        type: "object",
        properties: {
          name: { type: "string" },
          description: { type: ["string", "null"] },
          permissions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                resource: { type: "string" },
                actions: { type: "array", items: { type: "string" } },
              },
              required: ["resource", "actions"],
            },
          },
        },
        required: ["name"],
      },
      response: {
        201: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            data: {
              type: "object",
              properties: {
                id: { type: "string" },
                name: { type: "string" },
                description: { type: ["string", "null"] },
                permissions: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      resource: { type: "string" },
                      actions: { type: "array", items: { type: "string" } },
                    },
                  },
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
  }, async (request, reply) => {
    try {
      const { organizationId } = request.params as { organizationId: string };
      const result = await createRoleHandler(
        organizationId,
        request.body,
        request,
        fastify.logger,
      );
      return reply.status(201).send(result);
    } catch (error) {
      return handleError(error, reply);
    }
  });

  fastify.get("/", {
    schema: {
      tags: ["roles"],
      summary: "List all roles",
      description: "Retrieves a list of all roles in the organization",
      security: [{ bearerAuth: [] }],
      params: {
        type: "object",
        properties: {
          organizationId: { type: "string", format: "uuid" },
        },
        required: ["organizationId"],
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
                  id: { type: "string" },
                  name: { type: "string" },
                  description: { type: ["string", "null"] },
                  permissions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        resource: { type: "string" },
                        actions: { type: "array", items: { type: "string" } },
                      },
                    },
                  },
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
  }, async (request, reply) => {
    try {
      const { organizationId } = request.params as { organizationId: string };
      const result = await listRolesHandler(
        organizationId,
        request,
        fastify.logger,
      );
      return reply.send(result);
    } catch (error) {
      return handleError(error, reply);
    }
  });

  fastify.patch("/:roleId", {
    schema: {
      tags: ["roles"],
      summary: "Update role permissions",
      description: "Updates the permissions for a specific role",
      security: [{ bearerAuth: [] }],
      params: {
        type: "object",
        properties: {
          organizationId: { type: "string", format: "uuid" },
          roleId: { type: "string", format: "uuid" },
        },
        required: ["organizationId", "roleId"],
      },
      body: {
        type: "object",
        properties: {
          permissions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                resource: { type: "string" },
                actions: { type: "array", items: { type: "string" } },
              },
              required: ["resource", "actions"],
            },
          },
        },
        required: ["permissions"],
      },
      response: {
        200: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            data: {
              type: "object",
              properties: {
                id: { type: "string" },
                name: { type: "string" },
                description: { type: ["string", "null"] },
                permissions: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      resource: { type: "string" },
                      actions: { type: "array", items: { type: "string" } },
                    },
                  },
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
  }, async (request, reply) => {
    try {
      const { organizationId, roleId } = request.params as {
        organizationId: string;
        roleId: string;
      };
      const result = await updateRolePermissionsHandler(
        organizationId,
        roleId,
        request.body,
        request,
        fastify.logger,
      );
      return reply.send(result);
    } catch (error) {
      return handleError(error, reply);
    }
  });

  fastify.delete("/:roleId", {
    schema: {
      tags: ["roles"],
      summary: "Delete a role",
      description: "Deletes a role by its ID",
      security: [{ bearerAuth: [] }],
      params: {
        type: "object",
        properties: {
          organizationId: { type: "string", format: "uuid" },
          roleId: { type: "string", format: "uuid" },
        },
        required: ["organizationId", "roleId"],
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
      },
    },
  }, async (request, reply) => {
    try {
      const { organizationId, roleId } = request.params as {
        organizationId: string;
        roleId: string;
      };
      const result = await deleteRoleHandler(
        organizationId,
        roleId,
        request,
        fastify.logger,
      );
      return reply.send(result);
    } catch (error) {
      return handleError(error, reply);
    }
  });
};

export default rolesRoutes;
