import { z } from "zod";
import { auth } from "@repo/auth";
import { OrganizationIdParamSchema } from "../schemas/auth.schema";
import { requireOrgMembership } from "../middleware/require-auth.middleware";
import {
  createValidationError,
  createUnauthorizedError,
} from "../../../shared/errors/app-error";
import type { FastifyRequest } from "fastify";
import type { LoggerHelpers } from "../../../plugins/logger";

export type SwitchOrganizationResult = {
  activeOrganizationId: string;
};

export async function switchOrganizationHandler(
  organizationId: unknown,
  request: FastifyRequest,
  headers: Headers,
  logger: LoggerHelpers,
): Promise<SwitchOrganizationResult> {
  logger.debug("SwitchOrganizationCommand received", { organizationId });

  if (!request.user) {
    throw createUnauthorizedError();
  }

  const parseResult = OrganizationIdParamSchema.safeParse({ organizationId });
  if (!parseResult.success) {
    const errors = z.flattenError(parseResult.error);
    throw createValidationError({ fieldErrors: errors.fieldErrors });
  }

  const validatedOrgId = parseResult.data.organizationId;

  await requireOrgMembership(request, validatedOrgId);

  await auth.api.setActiveOrganization({
    body: { organizationId: validatedOrgId },
    headers,
  });

  logger.info("Active organization switched", {
    userId: request.user.id,
    organizationId: validatedOrgId,
  });

  return { activeOrganizationId: validatedOrgId };
}
