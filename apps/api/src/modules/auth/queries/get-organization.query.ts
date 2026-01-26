import { mapZodErrors } from "../../../utils/mapZodErrors";
import { db, eq } from "@repo/database";
import { organization } from "@repo/database/schema/auth";
import { OrganizationIdParamSchema } from "../schemas/auth.schema";
import { requireOrgMembership } from "../middleware/require-auth.middleware";
// removed unused imports
import type { FastifyRequest } from "fastify";
import type { LoggerHelpers } from "../../../plugins/logger";

import type { ServiceResult } from "../../../utils/ServiceResult";

export type GetOrganizationResult = ServiceResult<{
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
}>;

export async function getOrganizationHandler(
  organizationId: unknown,
  request: FastifyRequest,
  logger: LoggerHelpers,
): Promise<GetOrganizationResult> {
  logger.debug("GetOrganizationQuery received", { organizationId });

  const parseResult = OrganizationIdParamSchema.safeParse({ organizationId });
  if (!parseResult.success) {
    return {
      isSuccess: false,
      errors: mapZodErrors(parseResult.error),
    };
  }

  const validatedOrgId = parseResult.data.organizationId;

  let membership;
  try {
    membership = await requireOrgMembership(request, validatedOrgId);
  } catch {
    return {
      isSuccess: false,
      errors: [
        {
          code: "FORBIDDEN",
          message: "User is not a member of this organization",
        },
      ],
    };
  }

  const [org] = await db
    .select()
    .from(organization)
    .where(eq(organization.id, validatedOrgId))
    .limit(1);

  if (!org || org.isDeleted) {
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

  logger.info("Organization retrieved", { organizationId: validatedOrgId });

  return {
    isSuccess: true,
    data: {
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
    },
  };
}
