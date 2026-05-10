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

  // Aggregate
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const roleMap = new Map<string, any>();

  for (const row of rows) {
    // ⚡ Bolt: Optimize Map lookup by caching the entry to avoid redundant searches
    let entry = roleMap.get(row.role.id);
    if (!entry) {
      entry = {
        ...row.role,
        permissions: [],
      };
      roleMap.set(row.role.id, entry);
    }

    if (row.permission) {
      entry.permissions.push({
        resource: row.permission.resource,
        actions: row.permission.actions,
      });
    }
  }

  return {
    isSuccess: true,
    data: {
      roles: Array.from(roleMap.values()),
    },
  };
}
