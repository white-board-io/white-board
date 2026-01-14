import { z } from "zod";
import { db, eq } from "@repo/database";
import { invitation, member, organization } from "@repo/database/schema/auth";
import { AcceptInvitationInputSchema, type AcceptInvitationInput } from "../schemas/auth.schema";
import {
  createValidationError,
  createNotFoundError,
  createForbiddenError,
  createUnauthorizedError,
} from "../../../shared/errors/app-error";
import type { FastifyRequest } from "fastify";
import type { LoggerHelpers } from "../../../plugins/logger";

export type AcceptInvitationResult = {
  organization: {
    id: string;
    name: string;
  };
  role: string;
};

export async function acceptInvitationHandler(
  input: unknown,
  request: FastifyRequest,
  logger: LoggerHelpers
): Promise<AcceptInvitationResult> {
  logger.debug("AcceptInvitationCommand received");

  if (!request.user) {
    throw createUnauthorizedError();
  }

  const parseResult = AcceptInvitationInputSchema.safeParse(input);
  if (!parseResult.success) {
    const errors = z.flattenError(parseResult.error);
    logger.warn("Validation failed for AcceptInvitationCommand", { errors });
    throw createValidationError({ fieldErrors: errors.fieldErrors });
  }

  const validatedInput: AcceptInvitationInput = parseResult.data;

  const [invitationRecord] = await db
    .select()
    .from(invitation)
    .where(eq(invitation.id, validatedInput.invitationId))
    .limit(1);

  if (!invitationRecord) {
    throw createNotFoundError("Invitation", validatedInput.invitationId);
  }

  if (invitationRecord.email !== request.user.email) {
    throw createForbiddenError("This invitation is for a different email address");
  }

  if (invitationRecord.status !== "pending") {
    throw createForbiddenError("This invitation has already been used or cancelled");
  }

  if (new Date() > invitationRecord.expiresAt) {
    await db
      .update(invitation)
      .set({ status: "expired" })
      .where(eq(invitation.id, validatedInput.invitationId));

    throw createForbiddenError("This invitation has expired");
  }

  const [org] = await db
    .select()
    .from(organization)
    .where(eq(organization.id, invitationRecord.organizationId))
    .limit(1);

  if (!org || org.isDeleted) {
    throw createNotFoundError("Organization", invitationRecord.organizationId);
  }

  await db.insert(member).values({
    organizationId: invitationRecord.organizationId,
    userId: request.user.id,
    role: invitationRecord.role || "student",
  });

  await db
    .update(invitation)
    .set({ status: "accepted" })
    .where(eq(invitation.id, validatedInput.invitationId));

  logger.info("Invitation accepted", {
    invitationId: validatedInput.invitationId,
    userId: request.user.id,
    organizationId: invitationRecord.organizationId,
  });

  return {
    organization: {
      id: org.id,
      name: org.name,
    },
    role: invitationRecord.role || "student",
  };
}
