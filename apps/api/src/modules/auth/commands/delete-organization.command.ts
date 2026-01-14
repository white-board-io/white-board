import { z } from "zod";
import { db, eq } from "@repo/database";
import { organization } from "@repo/database/schema/auth";
import { OrganizationIdParamSchema } from "../schemas/auth.schema";
import { requirePermission } from "../middleware/require-auth.middleware";
import { createValidationError, createNotFoundError } from "../../../shared/errors/app-error";
import type { FastifyRequest } from "fastify";
import type { LoggerHelpers } from "../../../plugins/logger";

export type DeleteOrganizationResult = {
  success: boolean;
};

export async function deleteOrganizationHandler(
  organizationId: unknown,
  request: FastifyRequest,
  logger: LoggerHelpers
): Promise<DeleteOrganizationResult> {
  logger.debug("DeleteOrganizationCommand received", { organizationId });

  const parseResult = OrganizationIdParamSchema.safeParse({ organizationId });
  if (!parseResult.success) {
    const errors = z.flattenError(parseResult.error);
    throw createValidationError({ fieldErrors: errors.fieldErrors });
  }

  const validatedOrgId = parseResult.data.organizationId;

  await requirePermission(request, validatedOrgId, "organization", "delete");

  const [existingOrg] = await db
    .select()
    .from(organization)
    .where(eq(organization.id, validatedOrgId))
    .limit(1);

  if (!existingOrg || existingOrg.isDeleted) {
    throw createNotFoundError("Organization", validatedOrgId);
  }

  await db
    .update(organization)
    .set({ isDeleted: true })
    .where(eq(organization.id, validatedOrgId));

  logger.info("Organization deleted (soft delete)", { organizationId: validatedOrgId });

  return { success: true };
}
