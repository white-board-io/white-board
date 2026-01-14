import { z } from "zod";
import { db, eq } from "@repo/database";
import { organization } from "@repo/database/schema/auth";
import {
  UpdateOrganizationInputSchema,
  OrganizationIdParamSchema,
  type UpdateOrganizationInput,
} from "../schemas/auth.schema";
import { requirePermission } from "../middleware/require-auth.middleware";
import { createValidationError, createNotFoundError } from "../../../shared/errors/app-error";
import type { FastifyRequest } from "fastify";
import type { LoggerHelpers } from "../../../plugins/logger";

export type UpdateOrganizationResult = {
  organization: {
    id: string;
    name: string;
    slug: string | null;
    organizationType: string;
  };
};

export async function updateOrganizationHandler(
  organizationId: unknown,
  input: unknown,
  request: FastifyRequest,
  logger: LoggerHelpers
): Promise<UpdateOrganizationResult> {
  logger.debug("UpdateOrganizationCommand received", { organizationId });

  const idParseResult = OrganizationIdParamSchema.safeParse({ organizationId });
  if (!idParseResult.success) {
    const errors = z.flattenError(idParseResult.error);
    throw createValidationError({ fieldErrors: errors.fieldErrors });
  }

  const validatedOrgId = idParseResult.data.organizationId;

  await requirePermission(request, validatedOrgId, "organization", "update");

  const parseResult = UpdateOrganizationInputSchema.safeParse(input);
  if (!parseResult.success) {
    const errors = z.flattenError(parseResult.error);
    logger.warn("Validation failed for UpdateOrganizationCommand", { errors });
    throw createValidationError({ fieldErrors: errors.fieldErrors });
  }

  const validatedInput: UpdateOrganizationInput = parseResult.data;

  const [existingOrg] = await db
    .select()
    .from(organization)
    .where(eq(organization.id, validatedOrgId))
    .limit(1);

  if (!existingOrg || existingOrg.isDeleted) {
    throw createNotFoundError("Organization", validatedOrgId);
  }

  const updateData: Record<string, unknown> = {};
  if (validatedInput.name !== undefined) updateData.name = validatedInput.name;
  if (validatedInput.organizationType !== undefined) updateData.organizationType = validatedInput.organizationType;
  if (validatedInput.logo !== undefined) updateData.logo = validatedInput.logo;
  if (validatedInput.addressLine1 !== undefined) updateData.addressLine1 = validatedInput.addressLine1;
  if (validatedInput.addressLine2 !== undefined) updateData.addressLine2 = validatedInput.addressLine2;
  if (validatedInput.city !== undefined) updateData.city = validatedInput.city;
  if (validatedInput.state !== undefined) updateData.state = validatedInput.state;
  if (validatedInput.zip !== undefined) updateData.zip = validatedInput.zip;
  if (validatedInput.country !== undefined) updateData.country = validatedInput.country;
  if (validatedInput.phone !== undefined) updateData.phone = validatedInput.phone;
  if (validatedInput.email !== undefined) updateData.email = validatedInput.email;
  if (validatedInput.website !== undefined) updateData.website = validatedInput.website;
  if (validatedInput.description !== undefined) updateData.description = validatedInput.description;

  const [updatedOrg] = await db
    .update(organization)
    .set(updateData)
    .where(eq(organization.id, validatedOrgId))
    .returning();

  logger.info("Organization updated successfully", { organizationId: validatedOrgId });

  return {
    organization: {
      id: updatedOrg.id,
      name: updatedOrg.name,
      slug: updatedOrg.slug,
      organizationType: updatedOrg.organizationType,
    },
  };
}
