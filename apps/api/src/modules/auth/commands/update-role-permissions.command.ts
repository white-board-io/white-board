import { z } from "zod";
import {
  UpdateRolePermissionsInputSchema,
  RoleIdParamSchema,
} from "../schemas/role.schema";
import { OrganizationIdParamSchema } from "../schemas/auth.schema";
import { requirePermission } from "../middleware/require-auth.middleware";
import { roleRepository } from "../repository/role.repository";
import { createValidationError, createNotFoundError } from "../../../shared/errors/app-error";
import type { FastifyRequest } from "fastify";
import type { LoggerHelpers } from "../../../plugins/logger";

export async function updateRolePermissionsHandler(
  organizationId: unknown,
  roleId: unknown,
  input: unknown,
  request: FastifyRequest,
  logger: LoggerHelpers
) {
  const orgIdParse = OrganizationIdParamSchema.safeParse({ organizationId });
  const roleIdParse = RoleIdParamSchema.safeParse({ roleId });

  if (!orgIdParse.success || !roleIdParse.success) {
      const errors = {
          ...(!orgIdParse.success ? z.flattenError(orgIdParse.error).fieldErrors : {}),
          ...(!roleIdParse.success ? z.flattenError(roleIdParse.error).fieldErrors : {}),
      };
      throw createValidationError({ fieldErrors: errors });
  }
  const orgId = orgIdParse.data.organizationId;
  const targetRoleId = roleIdParse.data.roleId;

  await requirePermission(request, orgId, "organization", "update");

  const parseResult = UpdateRolePermissionsInputSchema.safeParse(input);
  if (!parseResult.success) {
    throw createValidationError({ fieldErrors: z.flattenError(parseResult.error).fieldErrors });
  }
  const data = parseResult.data;

  const targetRole = await roleRepository.findById(orgId, targetRoleId);

  if (!targetRole) {
    throw createNotFoundError("Role", targetRoleId);
  }

  await roleRepository.updatePermissions(orgId, targetRoleId, data.permissions);

  logger.info("Role permissions updated", { roleId: targetRoleId, organizationId: orgId });

  return { success: true };
}
