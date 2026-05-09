import { mapZodErrors } from "../../../utils/mapZodErrors";
import { roleRepository } from "../repository/role.repository";
import { OrganizationIdParamSchema } from "../schemas/auth.schema";
import { requirePermission } from "../middleware/require-auth.middleware";
// removed unused imports
import type { FastifyRequest } from "fastify";
import type { LoggerHelpers } from "../../../plugins/logger";

import type { ServiceResult } from "../../../utils/ServiceResult";

import { role } from "@repo/database/schema/roles";

type RoleEntity = typeof role.$inferSelect;
type RoleWithPermissions = RoleEntity & {
  permissions: { resource: string; actions: string[] }[];
};

export type ListRolesResult = ServiceResult<{
  roles: RoleWithPermissions[];
}>;

export async function listRolesHandler(
  organizationId: unknown,
  request: FastifyRequest,
  logger: LoggerHelpers,
): Promise<ListRolesResult> {
  logger.debug("ListRolesQuery received", { organizationId });
  const idParse = OrganizationIdParamSchema.safeParse({ organizationId });
  if (!idParse.success) {
    return {
      isSuccess: false,
      errors: mapZodErrors(idParse.error),
    };
  }
  const orgId = idParse.data.organizationId;

  try {
    await requirePermission(request, orgId, "member", "read");
  } catch {
    return {
      isSuccess: false,
      errors: [
        {
          code: "FORBIDDEN",
          message: "Insufficient permissions to read roles",
        },
      ],
    };
  }

  // listByOrg already aggregates roles with their permissions
  const roles = await roleRepository.listByOrg(orgId);

  // Map to the expected DTO format
  const mappedRoles = roles.map((r) => ({
    ...r,
    permissions: r.permissions.map((p) => ({
      resource: p.resource,
      actions: p.actions,
    })),
  }));

  return {
    isSuccess: true,
    data: {
      roles: mappedRoles,
    },
  };
}
