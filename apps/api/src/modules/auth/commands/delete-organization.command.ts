import { mapZodErrors } from "../../../utils/mapZodErrors";
import { db, eq } from "@repo/database";
import { organization } from "@repo/database/schema/auth";
import { OrganizationIdParamSchema } from "../schemas/auth.schema";
import { requirePermission } from "../middleware/require-auth.middleware";
import type { FastifyRequest } from "fastify";
import type { LoggerHelpers } from "../../../plugins/logger";

import type { ServiceResult } from "../../../utils/ServiceResult";

export type DeleteOrganizationResult = ServiceResult<{ success: boolean }>;

export async function deleteOrganizationHandler(
  organizationId: unknown,
  request: FastifyRequest,
  logger: LoggerHelpers,
): Promise<DeleteOrganizationResult> {
  logger.debug("DeleteOrganizationCommand received", { organizationId });

  const parseResult = OrganizationIdParamSchema.safeParse({ organizationId });
  if (!parseResult.success) {
    return {
      isSuccess: false,
      errors: mapZodErrors(parseResult.error),
    };
  }

  const validatedOrgId = parseResult.data.organizationId;

  try {
    await requirePermission(request, validatedOrgId, "organization", "delete");
  } catch {
    return {
      isSuccess: false,
      errors: [
        {
          code: "FORBIDDEN",
          message: "Insufficient permissions to delete organization",
        },
      ],
    };
  }

  const [existingOrg] = await db
    .select()
    .from(organization)
    .where(eq(organization.id, validatedOrgId))
    .limit(1);

  if (!existingOrg || existingOrg.isDeleted) {
    return {
      isSuccess: false,
      errors: [
        {
          code: "RESOURCE_NOT_FOUND",
          message: `Organization ${validatedOrgId} not found`,
          value: validatedOrgId,
        },
      ],
    };
  }

  await db
    .update(organization)
    .set({ isDeleted: true })
    .where(eq(organization.id, validatedOrgId));

  logger.info("Organization deleted (soft delete)", {
    organizationId: validatedOrgId,
  });

  return { isSuccess: true, data: { success: true } };
}
