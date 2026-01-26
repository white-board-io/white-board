import { mapZodErrors } from "../../../utils/mapZodErrors";
import { auth } from "@repo/auth";
import { OrganizationIdParamSchema } from "../schemas/auth.schema";
import { requireOrgMembership } from "../middleware/require-auth.middleware";
// removed unused imports
import type { FastifyRequest } from "fastify";
import type { LoggerHelpers } from "../../../plugins/logger";

import type { ServiceResult } from "../../../utils/ServiceResult";

export type SwitchOrganizationResult = ServiceResult<{
  activeOrganizationId: string;
}>;

export async function switchOrganizationHandler(
  organizationId: unknown,
  request: FastifyRequest,
  headers: Headers,
  logger: LoggerHelpers,
): Promise<SwitchOrganizationResult> {
  logger.debug("SwitchOrganizationCommand received", { organizationId });

  if (!request.user) {
    return {
      isSuccess: false,
      errors: [{ code: "UNAUTHORIZED", message: "Authentication required" }],
    };
  }

  const parseResult = OrganizationIdParamSchema.safeParse({ organizationId });
  if (!parseResult.success) {
    return {
      isSuccess: false,
      errors: mapZodErrors(parseResult.error),
    };
  }

  const validatedOrgId = parseResult.data.organizationId;

  try {
    await requireOrgMembership(request, validatedOrgId);
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

  await auth.api.setActiveOrganization({
    body: { organizationId: validatedOrgId },
    headers,
  });

  logger.info("Active organization switched", {
    userId: request.user.id,
    organizationId: validatedOrgId,
  });

  return { isSuccess: true, data: { activeOrganizationId: validatedOrgId } };
}
