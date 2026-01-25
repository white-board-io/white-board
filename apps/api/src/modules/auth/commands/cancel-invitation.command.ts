import { mapZodErrors } from "../../../utils/mapZodErrors";
import { z } from "zod";
import { db, eq, and } from "@repo/database";
import { invitation } from "@repo/database/schema/auth";
import { requirePermission } from "../middleware/require-auth.middleware";
// removed unused imports
import type { FastifyRequest } from "fastify";
import type { ServiceResult } from "../../../utils/ServiceResult";
import type { LoggerHelpers } from "../../../plugins/logger";
import { AuthValidationErrorCodes } from "../schemas/auth.schema";

export const CancelInvitationInputSchema = z.object({
  invitationId: z
    .string()
    .uuid({ message: AuthValidationErrorCodes.INVITATION_ID_REQUIRED }),
  organizationId: z
    .string()
    .uuid({ message: AuthValidationErrorCodes.ORGANIZATION_ID_INVALID }),
});

export type CancelInvitationInput = z.infer<typeof CancelInvitationInputSchema>;

export type CancelInvitationResult = ServiceResult<{ success: boolean }>;

export async function cancelInvitationHandler(
  input: unknown,
  request: FastifyRequest,
  logger: LoggerHelpers,
): Promise<CancelInvitationResult> {
  logger.debug("CancelInvitationCommand received");

  const parseResult = CancelInvitationInputSchema.safeParse(input);
  if (!parseResult.success) {
    const errors = mapZodErrors(parseResult.error);
    logger.warn("Validation failed for CancelInvitationCommand", { errors });
    return {
      isSuccess: false,
      errors,
    };
  }

  const validatedInput: CancelInvitationInput = parseResult.data;

  try {
    await requirePermission(
      request,
      validatedInput.organizationId,
      "invitation",
      "delete",
    );
  } catch {
    return {
      isSuccess: false,
      errors: [
        {
          code: "FORBIDDEN",
          message: "Insufficient permissions to cancel invitation",
        },
      ],
    };
  }

  const [invitationRecord] = await db
    .select()
    .from(invitation)
    .where(
      and(
        eq(invitation.id, validatedInput.invitationId),
        eq(invitation.organizationId, validatedInput.organizationId),
      ),
    )
    .limit(1);

  if (!invitationRecord) {
    return {
      isSuccess: false,
      errors: [
        {
          code: "RESOURCE_NOT_FOUND",
          message: `Invitation ${validatedInput.invitationId} not found`,
          value: validatedInput.invitationId,
        },
      ],
    };
  }

  if (invitationRecord.status !== "pending") {
    return {
      isSuccess: false,
      errors: [
        { code: "FORBIDDEN", message: "Can only cancel pending invitations" },
      ],
    };
  }

  await db
    .update(invitation)
    .set({ status: "cancelled" })
    .where(eq(invitation.id, validatedInput.invitationId));

  logger.info("Invitation cancelled", {
    invitationId: validatedInput.invitationId,
    organizationId: validatedInput.organizationId,
  });

  return { isSuccess: true, data: { success: true } };
}
