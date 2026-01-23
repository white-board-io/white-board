import { FastifyPluginAsync } from "fastify";
import { createRoleHandler } from "../../../../modules/auth/commands/create-role.command";
import { updateRolePermissionsHandler } from "../../../../modules/auth/commands/update-role-permissions.command";
import { deleteRoleHandler } from "../../../../modules/auth/commands/delete-role.command";
import { listRolesHandler } from "../../../../modules/auth/queries/list-roles.query";
import { createErrorHandler } from "../../../../shared/utils/error-handler";
import { requireAuth } from "../../../../modules/auth/middleware/require-auth.middleware";

const rolesRoutes: FastifyPluginAsync = async (fastify) => {
  const handleError = createErrorHandler(fastify);

  fastify.addHook("preHandler", async (request, reply) => {
      await requireAuth(request, reply);
  });

  fastify.post("/", async (request, reply) => {
    try {
      const { organizationId } = request.params as { organizationId: string };
      const result = await createRoleHandler(organizationId, request.body, request, fastify.logger);
      return reply.status(201).send(result);
    } catch (error) {
      return handleError(error, reply);
    }
  });

  fastify.get("/", async (request, reply) => {
    try {
      const { organizationId } = request.params as { organizationId: string };
      const result = await listRolesHandler(organizationId, request, fastify.logger);
      return reply.send(result);
    } catch (error) {
      return handleError(error, reply);
    }
  });

  fastify.patch("/:roleId", async (request, reply) => {
    try {
      const { organizationId, roleId } = request.params as { organizationId: string, roleId: string };
      const result = await updateRolePermissionsHandler(organizationId, roleId, request.body, request, fastify.logger);
      return reply.send(result);
    } catch (error) {
      return handleError(error, reply);
    }
  });

  fastify.delete("/:roleId", async (request, reply) => {
    try {
      const { organizationId, roleId } = request.params as { organizationId: string, roleId: string };
      const result = await deleteRoleHandler(organizationId, roleId, request, fastify.logger);
      return reply.send(result);
    } catch (error) {
      return handleError(error, reply);
    }
  });
};

export default rolesRoutes;
