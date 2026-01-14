import { z } from "zod";
import { db, eq, and } from "@repo/database";
import { member } from "@repo/database/schema/auth";
import { RemoveMemberInputSchema, type RemoveMemberInput } from "../schemas/auth.schema";
import { requirePermission } from "../middleware/require-auth.middleware";
import { createValidationError, createNotFoundError, createForbiddenError } from "../../../shared/errors/app-error";
import type { FastifyRequest } from "fastify";
import type { LoggerHelpers } from "../../../plugins/logger";

export type RemoveMemberResult = {
  success: boolean;
};

export async function removeMemberHandler(
  input: unknown,
  request: FastifyRequest,
  logger: LoggerHelpers
): Promise<RemoveMemberResult> {
  logger.debug("RemoveMemberCommand received");

  const parseResult = RemoveMemberInputSchema.safeParse(input);
  if (!parseResult.success) {
    const errors = z.flattenError(parseResult.error);
    logger.warn("Validation failed for RemoveMemberCommand", { errors });
    throw createValidationError({ fieldErrors: errors.fieldErrors });
  }

  const validatedInput: RemoveMemberInput = parseResult.data;

  await requirePermission(request, validatedInput.organizationId, "member", "delete");

  const [memberRecord] = await db
    .select()
    .from(member)
    .where(
      and(
        eq(member.id, validatedInput.memberId),
        eq(member.organizationId, validatedInput.organizationId)
      )
    )
    .limit(1);

  if (!memberRecord) {
    throw createNotFoundError("Member", validatedInput.memberId);
  }

  if (memberRecord.role === "owner") {
    const ownerCount = await db
      .select()
      .from(member)
      .where(
        and(
          eq(member.organizationId, validatedInput.organizationId),
          eq(member.role, "owner")
        )
      );

    if (ownerCount.length <= 1) {
      throw createForbiddenError("Cannot remove the last owner of the organization");
    }
  }

  await db
    .delete(member)
    .where(eq(member.id, validatedInput.memberId));

  logger.info("Member removed", {
    memberId: validatedInput.memberId,
    organizationId: validatedInput.organizationId,
  });

  return { success: true };
}
