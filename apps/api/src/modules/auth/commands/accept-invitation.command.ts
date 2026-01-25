import { mapZodErrors } from "../../../utils/mapZodErrors";

import { db, eq } from "@repo/database";
import { invitation, member, organization } from "@repo/database/schema/auth";
import {
  AcceptInvitationInputSchema,
  type AcceptInvitationInput,
} from "../schemas/auth.schema";
import type { FastifyRequest } from "fastify";
import type { LoggerHelpers } from "../../../plugins/logger";

import type { ServiceResult } from "../../../utils/ServiceResult";

export type AcceptInvitationResult = ServiceResult<{
  organization: {
    id: string;
    name: string;
  };
  role: string;
}>;

export async function acceptInvitationHandler(
  input: unknown,
  request: FastifyRequest,
  logger: LoggerHelpers,
): Promise<AcceptInvitationResult> {
  logger.debug("AcceptInvitationCommand received");

  if (!request.user) {
    return {
      isSuccess: false,
      errors: [{ code: "UNAUTHORIZED", message: "Authentication required" }],
    };
  }

  const parseResult = AcceptInvitationInputSchema.safeParse(input);
  if (!parseResult.success) {
    return {
      isSuccess: false,
      errors: mapZodErrors(parseResult.error),
    };
  }

  const validatedInput: AcceptInvitationInput = parseResult.data;

  const [invitationRecord] = await db
    .select()
    .from(invitation)
    .where(eq(invitation.id, validatedInput.invitationId))
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

  if (invitationRecord.email !== request.user.email) {
    return {
      isSuccess: false,
      errors: [
        {
          code: "FORBIDDEN",
          message: "This invitation is for a different email address",
        },
      ],
    };
  }

  if (invitationRecord.status !== "pending") {
    return {
      isSuccess: false,
      errors: [
        {
          code: "FORBIDDEN",
          message: "This invitation has already been used or cancelled",
        },
      ],
    };
  }

  if (new Date() > invitationRecord.expiresAt) {
    await db
      .update(invitation)
      .set({ status: "expired" })
      .where(eq(invitation.id, validatedInput.invitationId));

    return {
      isSuccess: false,
      errors: [{ code: "FORBIDDEN", message: "This invitation has expired" }],
    };
  }

  const [org] = await db
    .select()
    .from(organization)
    .where(eq(organization.id, invitationRecord.organizationId))
    .limit(1);

  if (!org || org.isDeleted) {
    return {
      isSuccess: false,
      errors: [
        {
          code: "RESOURCE_NOT_FOUND",
          message: `Organization ${invitationRecord.organizationId} not found`,
          value: invitationRecord.organizationId,
        },
      ],
    };
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
    isSuccess: true,
    data: {
      organization: {
        id: org.id,
        name: org.name,
      },
      role: invitationRecord.role || "student",
    },
  };
}
