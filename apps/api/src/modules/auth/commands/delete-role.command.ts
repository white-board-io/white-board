import { mapZodErrors } from "../../../utils/mapZodErrors";
import { roleRepository } from "../repository/role.repository";
import { roleValidator } from "../validators/role.validator";
import { RoleIdParamSchema } from "../schemas/role.schema";
import { OrganizationIdParamSchema } from "../schemas/auth.schema";
import { requirePermission } from "../middleware/require-auth.middleware";
// removed unused imports
import type { FastifyRequest } from "fastify";
import type { LoggerHelpers } from "../../../plugins/logger";

import type { ServiceResult } from "../../../utils/ServiceResult";

export type DeleteRoleResult = ServiceResult<{ success: boolean }>;

export async function deleteRoleHandler(
  organizationId: unknown,
  roleId: unknown,
  request: FastifyRequest,
  logger: LoggerHelpers,
): Promise<DeleteRoleResult> {
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
          message: "Insufficient permissions to delete role",
        },
      ],
    };
  }

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

  try {
    roleValidator.validateSystemRoleDeletion(targetRole.type);
  } catch {
    return {
      isSuccess: false,
      errors: [{ code: "FORBIDDEN", message: "Cannot delete system roles" }],
    };
  }

  await roleRepository.delete(orgId, targetRoleId);

  logger.info("Role deleted", { roleId: targetRoleId, organizationId: orgId });

  return { isSuccess: true, data: { success: true } };
}
