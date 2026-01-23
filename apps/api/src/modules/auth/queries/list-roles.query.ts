import { z } from "zod";
import { roleRepository } from "../repository/role.repository";
import { OrganizationIdParamSchema } from "../schemas/auth.schema";
import { requirePermission } from "../middleware/require-auth.middleware";
import { createValidationError } from "../../../shared/errors/app-error";
import type { FastifyRequest } from "fastify";
import type { LoggerHelpers } from "../../../plugins/logger";

export async function listRolesHandler(
  organizationId: unknown,
  request: FastifyRequest,
  logger: LoggerHelpers
) {
  logger.debug("ListRolesQuery received", { organizationId });
  const idParse = OrganizationIdParamSchema.safeParse({ organizationId });
  if (!idParse.success) {
      throw createValidationError({ fieldErrors: z.flattenError(idParse.error).fieldErrors });
  }
  const orgId = idParse.data.organizationId;

  await requirePermission(request, orgId, "member", "read");

  const rows = await roleRepository.listByOrg(orgId);

  // Aggregate
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const roleMap = new Map<string, any>();

  for (const row of rows) {
    if (!roleMap.has(row.role.id)) {
      roleMap.set(row.role.id, {
        ...row.role,
        permissions: [],
      });
    }

    if (row.permission) {
        roleMap.get(row.role.id).permissions.push({
            resource: row.permission.resource,
            actions: row.permission.actions,
        });
    }
  }

  return {
    roles: Array.from(roleMap.values()),
  };
}
