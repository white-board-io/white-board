import { mapZodErrors } from "../../../utils/mapZodErrors";
import { roleRepository } from "../repository/role.repository";
import { OrganizationIdParamSchema } from "../schemas/auth.schema";
import { requirePermission } from "../middleware/require-auth.middleware";
// removed unused imports
import type { FastifyRequest } from "fastify";
import type { LoggerHelpers } from "../../../plugins/logger";

import type { ServiceResult } from "../../../utils/ServiceResult";

export type ListRolesResult = ServiceResult<{
  roles: any[];
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
  } catch (error) {
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

  const rows = await roleRepository.listByOrg(orgId);

  // Map the aggregated roles to remove internal IDs from the permissions array,
  // matching the expected API response schema.
  const roles = rows.map((role) => ({
    ...role,
    permissions: role.permissions.map((p: any) => ({
      resource: p.resource,
      actions: p.actions,
    })),
  }));

  return {
    isSuccess: true,
    data: {
      roles,
    },
  };
}
