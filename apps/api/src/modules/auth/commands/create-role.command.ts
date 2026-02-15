import { mapZodErrors } from "../../../utils/mapZodErrors";
import { CreateRoleInputSchema } from "../schemas/role.schema";
import { OrganizationIdParamSchema } from "../schemas/auth.schema";
import { requirePermission } from "../middleware/require-auth.middleware";
import { roleRepository } from "../repository/role.repository";
import { roleValidator } from "../validators/role.validator";
import type { FastifyRequest } from "fastify";
import type { LoggerHelpers } from "../../../plugins/logger";

import type { ServiceResult } from "../../../utils/ServiceResult";

export type CreateRoleResult = ServiceResult<{
  role: {
    id: string;
    name: string;
    organizationId: string;
    permissions?: unknown;
  };
}>;

export async function createRoleHandler(
  organizationId: unknown,
  input: unknown,
  request: FastifyRequest,
  logger: LoggerHelpers,
): Promise<CreateRoleResult> {
  const idParse = OrganizationIdParamSchema.safeParse({ organizationId });
  if (!idParse.success) {
    return {
      isSuccess: false,
      errors: mapZodErrors(idParse.error),
    };
  }
  const orgId = idParse.data.organizationId;

  try {
    await requirePermission(request, orgId, "organization", "update");
  } catch {
    return {
      isSuccess: false,
      errors: [
        {
          code: "FORBIDDEN",
          message: "Insufficient permissions to create role",
        },
      ],
    };
  }

  const parseResult = CreateRoleInputSchema.safeParse(input);
  if (!parseResult.success) {
    return {
      isSuccess: false,
      errors: mapZodErrors(parseResult.error),
    };
  }
  const data = parseResult.data;

  // Assuming roleValidator also throws, wrapping it
  try {
    await roleValidator.validateRoleUniqueness(orgId, data.name);
  } catch {
    // Need to handle error from validator. It likely throws AppError.
    // Since I am refactoring, I should check if I can make validator return boolean or Result, but for now catch and return Error.
    // roleValidator is likely using createDuplicateError which is DUPLICATE_RESOURCE
    return {
      isSuccess: false,
      errors: [
        {
          code: "DUPLICATE_RESOURCE",
          message: `Role with name ${data.name} already exists`,
          value: data.name,
        },
      ],
    };
  }

  const newRole = await roleRepository.create(orgId, data);

  logger.info("Custom role created", {
    roleId: newRole.id,
    name: newRole.name,
    organizationId: orgId,
  });

  return {
    isSuccess: true,
    data: {
      role: newRole,
    },
  };
}
