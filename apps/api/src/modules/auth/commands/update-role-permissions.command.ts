import { z } from "zod";
import { db, eq, and } from "@repo/database";
import { role, permission } from "@repo/database/schema/roles";
import {
  UpdateRolePermissionsInputSchema,
  RoleIdParamSchema,
} from "../schemas/role.schema";
import { OrganizationIdParamSchema } from "../schemas/auth.schema";
import { requirePermission } from "../middleware/require-auth.middleware";
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

  const [targetRole] = await db
    .select()
    .from(role)
    .where(and(eq(role.id, targetRoleId), eq(role.organizationId, orgId)))
    .limit(1);

  if (!targetRole) {
    throw createNotFoundError("Role", targetRoleId);
  }

  await db.transaction(async (tx) => {
    await tx.delete(permission).where(eq(permission.roleId, targetRoleId));

    if (data.permissions.length > 0) {
      const permissionValues = data.permissions.map((p) => ({
        roleId: targetRoleId,
        resource: p.resource,
        actions: p.actions,
      }));
      await tx.insert(permission).values(permissionValues);
    }
  });

  logger.info("Role permissions updated", { roleId: targetRoleId, organizationId: orgId });

  return { success: true };
}
