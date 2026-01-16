import { db, eq, and } from "@repo/database";
import { role } from "@repo/database/schema/roles";
import { RoleIdParamSchema } from "../schemas/role.schema";
import { OrganizationIdParamSchema } from "../schemas/auth.schema";
import { requirePermission } from "../middleware/require-auth.middleware";
import { createValidationError, createNotFoundError, createForbiddenError } from "../../../shared/errors/app-error";
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

  const [targetRole] = await db
    .select()
    .from(role)
    .where(and(eq(role.id, targetRoleId), eq(role.organizationId, orgId)))
    .limit(1);

  if (!targetRole) {
    throw createNotFoundError("Role", targetRoleId);
  }

  if (targetRole.type === "system") {
    throw createForbiddenError("ERR_SYSTEM_ROLE_DELETE");
  }

  await db.delete(role).where(eq(role.id, targetRoleId));

  logger.info("Role deleted", { roleId: targetRoleId, organizationId: orgId });

  return { success: true };
}
