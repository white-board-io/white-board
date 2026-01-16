import { z } from "zod";
import { db, eq, and } from "@repo/database";
import { role, permission } from "@repo/database/schema/roles";
import {
  CreateRoleInputSchema,
  type CreateRoleInput,
} from "../schemas/role.schema";
import { OrganizationIdParamSchema } from "../schemas/auth.schema";
import { requirePermission } from "../middleware/require-auth.middleware";
import { createValidationError, createDuplicateError } from "../../../shared/errors/app-error";
import type { FastifyRequest } from "fastify";
import type { LoggerHelpers } from "../../../plugins/logger";

export async function createRoleHandler(
  organizationId: unknown,
  input: unknown,
  request: FastifyRequest,
  logger: LoggerHelpers
) {
  const idParse = OrganizationIdParamSchema.safeParse({ organizationId });
  if (!idParse.success) {
      throw createValidationError({ fieldErrors: z.flattenError(idParse.error).fieldErrors });
  }
  const orgId = idParse.data.organizationId;

  // Require permission to update organization (implies managing roles)
  await requirePermission(request, orgId, "organization", "update");

  const parseResult = CreateRoleInputSchema.safeParse(input);
  if (!parseResult.success) {
    throw createValidationError({ fieldErrors: z.flattenError(parseResult.error).fieldErrors });
  }
  const data = parseResult.data;

  const existingRole = await db
    .select()
    .from(role)
    .where(and(eq(role.organizationId, orgId), eq(role.name, data.name)))
    .limit(1);

  if (existingRole.length > 0) {
    throw createDuplicateError("Role", "name", data.name);
  }

  const [newRole] = await db
    .insert(role)
    .values({
      organizationId: orgId,
      name: data.name,
      type: "custom",
      description: data.description,
    })
    .returning();

  if (data.permissions && data.permissions.length > 0) {
    const permissionValues = data.permissions.map((p) => ({
      roleId: newRole.id,
      resource: p.resource,
      actions: p.actions,
    }));
    await db.insert(permission).values(permissionValues);
  }

  logger.info("Custom role created", { roleId: newRole.id, name: newRole.name, organizationId: orgId });

  return {
    role: newRole,
  };
}
