import { mapZodErrors } from "../../../utils/mapZodErrors";
import { db, eq, and } from "@repo/database";
import { member } from "@repo/database/schema/auth";
import {
  RemoveMemberInputSchema,
  type RemoveMemberInput,
} from "../schemas/auth.schema";
import { requirePermission } from "../middleware/require-auth.middleware";
// removed unused imports
import type { FastifyRequest } from "fastify";
import type { LoggerHelpers } from "../../../plugins/logger";

import type { ServiceResult } from "../../../utils/ServiceResult";

export type RemoveMemberResult = ServiceResult<{ success: boolean }>;

export async function removeMemberHandler(
  input: unknown,
  request: FastifyRequest,
  logger: LoggerHelpers,
): Promise<RemoveMemberResult> {
  logger.debug("RemoveMemberCommand received");

  const parseResult = RemoveMemberInputSchema.safeParse(input);
  if (!parseResult.success) {
    const errors = mapZodErrors(parseResult.error);
    logger.warn("Validation failed for RemoveMemberCommand", { errors });
    return {
      isSuccess: false,
      errors,
    };
  }

  const validatedInput: RemoveMemberInput = parseResult.data;

  try {
    await requirePermission(
      request,
      validatedInput.organizationId,
      "member",
      "delete",
    );
  } catch {
    return {
      isSuccess: false,
      errors: [
        {
          code: "FORBIDDEN",
          message: "Insufficient permissions to remove member",
        },
      ],
    };
  }

  const [memberRecord] = await db
    .select()
    .from(member)
    .where(
      and(
        eq(member.id, validatedInput.memberId),
        eq(member.organizationId, validatedInput.organizationId),
      ),
    )
    .limit(1);

  if (!memberRecord) {
    return {
      isSuccess: false,
      errors: [
        {
          code: "RESOURCE_NOT_FOUND",
          message: `Member ${validatedInput.memberId} not found`,
          value: validatedInput.memberId,
        },
      ],
    };
  }

  if (memberRecord.role === "owner") {
    const ownerCount = await db
      .select()
      .from(member)
      .where(
        and(
          eq(member.organizationId, validatedInput.organizationId),
          eq(member.role, "owner"),
        ),
      );

    if (ownerCount.length <= 1) {
      return {
        isSuccess: false,
        errors: [
          {
            code: "FORBIDDEN",
            message: "Cannot remove the last owner of the organization",
          },
        ],
      };
    }
  }

  await db.delete(member).where(eq(member.id, validatedInput.memberId));

  logger.info("Member removed", {
    memberId: validatedInput.memberId,
    organizationId: validatedInput.organizationId,
  });

  return { isSuccess: true, data: { success: true } };
}
