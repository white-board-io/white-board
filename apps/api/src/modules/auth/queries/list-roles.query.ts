import { z } from "zod";
import { db, eq } from "@repo/database";
import { role, permission } from "@repo/database/schema/roles";
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
  const idParse = OrganizationIdParamSchema.safeParse({ organizationId });
  if (!idParse.success) {
      throw createValidationError({ fieldErrors: z.flattenError(idParse.error).fieldErrors });
  }
  const orgId = idParse.data.organizationId;

  // View roles might need less permission, e.g. member:read?
  // But let's stick to requireOrgMembership and maybe 'member:read' or just membership.
  // The logic says "user to customize permissions".
  // Let's use `member:read` as a proxy for "reading org config" or create a new resource permission.
  // For now, let's require 'member:read' which all staff/teachers have.
  await requirePermission(request, orgId, "member", "read");

  const rows = await db
    .select({
        role: role,
        permission: permission,
    })
    .from(role)
    .leftJoin(permission, eq(role.id, permission.roleId))
    .where(eq(role.organizationId, orgId));

  // Aggregate
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
