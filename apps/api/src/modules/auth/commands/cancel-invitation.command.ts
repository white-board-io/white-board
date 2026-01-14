import { z } from "zod";
import { db, eq, and } from "@repo/database";
import { invitation } from "@repo/database/schema/auth";
import { requirePermission } from "../middleware/require-auth.middleware";
import { createValidationError, createNotFoundError, createForbiddenError } from "../../../shared/errors/app-error";
import type { FastifyRequest } from "fastify";
import type { LoggerHelpers } from "../../../plugins/logger";
import { AuthValidationErrorCodes } from "../schemas/auth.schema";

export const CancelInvitationInputSchema = z.object({
  invitationId: z.string().uuid({ message: AuthValidationErrorCodes.INVITATION_ID_REQUIRED }),
  organizationId: z.string().uuid({ message: AuthValidationErrorCodes.ORGANIZATION_ID_INVALID }),
});

export type CancelInvitationInput = z.infer<typeof CancelInvitationInputSchema>;

export type CancelInvitationResult = {
  success: boolean;
};

export async function cancelInvitationHandler(
  input: unknown,
  request: FastifyRequest,
  logger: LoggerHelpers
): Promise<CancelInvitationResult> {
  logger.debug("CancelInvitationCommand received");

  const parseResult = CancelInvitationInputSchema.safeParse(input);
  if (!parseResult.success) {
    const errors = z.flattenError(parseResult.error);
    logger.warn("Validation failed for CancelInvitationCommand", { errors });
    throw createValidationError({ fieldErrors: errors.fieldErrors });
  }

  const validatedInput: CancelInvitationInput = parseResult.data;

  await requirePermission(request, validatedInput.organizationId, "invitation", "delete");

  const [invitationRecord] = await db
    .select()
    .from(invitation)
    .where(
      and(
        eq(invitation.id, validatedInput.invitationId),
        eq(invitation.organizationId, validatedInput.organizationId)
      )
    )
    .limit(1);

  if (!invitationRecord) {
    throw createNotFoundError("Invitation", validatedInput.invitationId);
  }

  if (invitationRecord.status !== "pending") {
    throw createForbiddenError("Can only cancel pending invitations");
  }

  await db
    .update(invitation)
    .set({ status: "cancelled" })
    .where(eq(invitation.id, validatedInput.invitationId));

  logger.info("Invitation cancelled", {
    invitationId: validatedInput.invitationId,
    organizationId: validatedInput.organizationId,
  });

  return { success: true };
}
