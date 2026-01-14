import { z } from "zod";
import { db, eq } from "@repo/database";
import { organization } from "@repo/database/schema/auth";
import { OrganizationIdParamSchema } from "../schemas/auth.schema";
import { requireOrgMembership } from "../middleware/require-auth.middleware";
import { createValidationError, createNotFoundError } from "../../../shared/errors/app-error";
import type { FastifyRequest } from "fastify";
import type { LoggerHelpers } from "../../../plugins/logger";

export type GetOrganizationResult = {
  organization: {
    id: string;
    name: string;
    slug: string | null;
    organizationType: string;
    logo: string | null;
    addressLine1: string | null;
    addressLine2: string | null;
    city: string | null;
    state: string | null;
    zip: string | null;
    country: string | null;
    phone: string | null;
    email: string | null;
    website: string | null;
    description: string | null;
    createdAt: Date;
  };
  role: string;
};

export async function getOrganizationHandler(
  organizationId: unknown,
  request: FastifyRequest,
  logger: LoggerHelpers
): Promise<GetOrganizationResult> {
  logger.debug("GetOrganizationQuery received", { organizationId });

  const parseResult = OrganizationIdParamSchema.safeParse({ organizationId });
  if (!parseResult.success) {
    const errors = z.flattenError(parseResult.error);
    throw createValidationError({ fieldErrors: errors.fieldErrors });
  }

  const validatedOrgId = parseResult.data.organizationId;

  const membership = await requireOrgMembership(request, validatedOrgId);

  const [org] = await db
    .select()
    .from(organization)
    .where(eq(organization.id, validatedOrgId))
    .limit(1);

  if (!org || org.isDeleted) {
    throw createNotFoundError("Organization", validatedOrgId);
  }

  logger.info("Organization retrieved", { organizationId: validatedOrgId });

  return {
    organization: {
      id: org.id,
      name: org.name,
      slug: org.slug,
      organizationType: org.organizationType,
      logo: org.logo,
      addressLine1: org.addressLine1,
      addressLine2: org.addressLine2,
      city: org.city,
      state: org.state,
      zip: org.zip,
      country: org.country,
      phone: org.phone,
      email: org.email,
      website: org.website,
      description: org.description,
      createdAt: org.createdAt,
    },
    role: membership.role,
  };
}
