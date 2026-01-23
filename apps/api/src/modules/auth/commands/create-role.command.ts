import { z } from "zod";
import {
  CreateRoleInputSchema,
} from "../schemas/role.schema";
import { OrganizationIdParamSchema } from "../schemas/auth.schema";
import { requirePermission } from "../middleware/require-auth.middleware";
import { roleRepository } from "../repository/role.repository";
import { roleValidator } from "../validators/role.validator";
import { createValidationError } from "../../../shared/errors/app-error";
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

  await requirePermission(request, orgId, "organization", "update");

  const parseResult = CreateRoleInputSchema.safeParse(input);
  if (!parseResult.success) {
    throw createValidationError({ fieldErrors: z.flattenError(parseResult.error).fieldErrors });
  }
  const data = parseResult.data;

  await roleValidator.validateRoleUniqueness(orgId, data.name);

  const newRole = await roleRepository.create(orgId, data);

  logger.info("Custom role created", { roleId: newRole.id, name: newRole.name, organizationId: orgId });

  return {
    role: newRole,
  };
}
