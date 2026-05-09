import { mapZodErrors } from "../../../utils/mapZodErrors";
import {
  UpdateRolePermissionsInputSchema,
  RoleIdParamSchema,
} from "../schemas/role.schema";
import { OrganizationIdParamSchema } from "../schemas/auth.schema";
import { requirePermission } from "../middleware/require-auth.middleware";
import { roleRepository } from "../repository/role.repository";
import type { FastifyRequest } from "fastify";
import type { LoggerHelpers } from "../../../plugins/logger";

import type { ServiceResult } from "../../../utils/ServiceResult";

export type UpdateRolePermissionsResult = ServiceResult<{ success: boolean }>;

export async function updateRolePermissionsHandler(
  organizationId: unknown,
  roleId: unknown,
  input: unknown,
  request: FastifyRequest,
  logger: LoggerHelpers,
): Promise<UpdateRolePermissionsResult> {
  const orgIdParse = OrganizationIdParamSchema.safeParse({ organizationId });
  const roleIdParse = RoleIdParamSchema.safeParse({ roleId });

  if (!orgIdParse.success || !roleIdParse.success) {
    return {
      isSuccess: false,
      errors: [
        ...(orgIdParse.error ? mapZodErrors(orgIdParse.error) : []),
        ...(roleIdParse.error ? mapZodErrors(roleIdParse.error) : []),
      ],
    };
  }
  const orgId = orgIdParse.data.organizationId;
  const targetRoleId = roleIdParse.data.roleId;

  try {
    await requirePermission(request, orgId, "organization", "update");
  } catch {
    return {
      isSuccess: false,
      errors: [
        {
          code: "FORBIDDEN",
          message: "Insufficient permissions to update role permissions",
        },
      ],
    };
  }

  const parseResult = UpdateRolePermissionsInputSchema.safeParse(input);
  if (!parseResult.success) {
    return {
      isSuccess: false,
      errors: mapZodErrors(parseResult.error),
    };
  }
  const data = parseResult.data;

  const targetRole = await roleRepository.findById(orgId, targetRoleId);

  if (!targetRole) {
    return {
      isSuccess: false,
      errors: [
        {
          code: "RESOURCE_NOT_FOUND",
          message: `Role ${targetRoleId} not found`,
          value: targetRoleId,
        },
      ],
    };
  }

  await roleRepository.updatePermissions(orgId, targetRoleId, data.permissions);

  logger.info("Role permissions updated", {
    roleId: targetRoleId,
    organizationId: orgId,
  });

  return { isSuccess: true, data: { success: true } };
}
