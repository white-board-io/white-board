import { roleRepository } from "../repository/role.repository";
import { roleValidator } from "../validators/role.validator";
import { RoleIdParamSchema } from "../schemas/role.schema";
import { OrganizationIdParamSchema } from "../schemas/auth.schema";
import { requirePermission } from "../middleware/require-auth.middleware";
import { createValidationError, createNotFoundError } from "../../../shared/errors/app-error";
import type { FastifyRequest } from "fastify";
import type { LoggerHelpers } from "../../../plugins/logger";

export async function deleteRoleHandler(
  organizationId: unknown,
  roleId: unknown,
  request: FastifyRequest,
  logger: LoggerHelpers
) {
  const orgIdParse = OrganizationIdParamSchema.safeParse({ organizationId });
  const roleIdParse = RoleIdParamSchema.safeParse({ roleId });

  if (!orgIdParse.success || !roleIdParse.success) {
      throw createValidationError({ fieldErrors: {} });
  }
  const orgId = orgIdParse.data.organizationId;
  const targetRoleId = roleIdParse.data.roleId;

  await requirePermission(request, orgId, "organization", "update");

  const targetRole = await roleRepository.findById(orgId, targetRoleId);

  if (!targetRole) {
    throw createNotFoundError("Role", targetRoleId);
  }

  roleValidator.validateSystemRoleDeletion(targetRole.type);

  await roleRepository.delete(orgId, targetRoleId);

  logger.info("Role deleted", { roleId: targetRoleId, organizationId: orgId });

  return { success: true };
}
