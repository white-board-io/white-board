import { mapZodErrors } from "../../../utils/mapZodErrors";
import { db, eq, and } from "@repo/database";
import {
  invitation,
  member,
  user,
  organization,
} from "@repo/database/schema/auth";
import {
  InviteMemberInputSchema,
  type InviteMemberInput,
} from "../schemas/auth.schema";
import { requirePermission } from "../middleware/require-auth.middleware";
import { roleValidator } from "../validators/role.validator";
import type { FastifyRequest } from "fastify";
import type { LoggerHelpers } from "../../../plugins/logger";

import type { ServiceResult } from "../../../utils/ServiceResult";

export type InviteMemberResult = ServiceResult<{
  invitation: {
    id: string;
    email: string;
    role: string;
    expiresAt: Date;
  };
}>;

export async function inviteMemberHandler(
  input: unknown,
  request: FastifyRequest,
  logger: LoggerHelpers,
): Promise<InviteMemberResult> {
  logger.debug("InviteMemberCommand received");

  if (!request.user) {
    return {
      isSuccess: false,
      errors: [{ code: "UNAUTHORIZED", message: "Authentication required" }],
    };
  }

  const parseResult = InviteMemberInputSchema.safeParse(input);
  if (!parseResult.success) {
    const errors = mapZodErrors(parseResult.error);
    logger.warn("Validation failed for InviteMemberCommand", { errors });
    return {
      isSuccess: false,
      errors,
    };
  }

  const validatedInput: InviteMemberInput = parseResult.data;

  try {
    await requirePermission(
      request,
      validatedInput.organizationId,
      "invitation",
      "create",
    );
  } catch (error) {
    return {
      isSuccess: false,
      errors: [
        {
          code: "FORBIDDEN",
          message: "Insufficient permissions to invite members",
        },
      ],
    };
  }

  const [org] = await db
    .select()
    .from(organization)
    .where(eq(organization.id, validatedInput.organizationId))
    .limit(1);

  if (!org || org.isDeleted) {
    return {
      isSuccess: false,
      errors: [
        {
          code: "RESOURCE_NOT_FOUND",
          message: `Organization ${validatedInput.organizationId} not found`,
          value: validatedInput.organizationId,
        },
      ],
    };
  }

  try {
    await roleValidator.validateRoleExists(
      validatedInput.organizationId,
      validatedInput.role,
    );
  } catch (error) {
    return {
      isSuccess: false,
      errors: [
        {
          code: "VALIDATION_ERROR",
          message: `Role ${validatedInput.role} does not exist`,
          value: validatedInput.role,
        },
      ],
    };
  }

  const existingUser = await db
    .select()
    .from(user)
    .where(eq(user.email, validatedInput.email))
    .limit(1);

  if (existingUser.length > 0) {
    const existingMember = await db
      .select()
      .from(member)
      .where(
        and(
          eq(member.userId, existingUser[0].id),
          eq(member.organizationId, validatedInput.organizationId),
        ),
      )
      .limit(1);

    if (existingMember.length > 0) {
      return {
        isSuccess: false,
        errors: [
          {
            code: "DUPLICATE_RESOURCE",
            message: `User with email ${validatedInput.email} is already a member`,
            value: validatedInput.email,
          },
        ],
      };
    }
  }

  const existingInvitation = await db
    .select()
    .from(invitation)
    .where(
      and(
        eq(invitation.email, validatedInput.email),
        eq(invitation.organizationId, validatedInput.organizationId),
        eq(invitation.status, "pending"),
      ),
    )
    .limit(1);

  if (existingInvitation.length > 0) {
    return {
      isSuccess: false,
      errors: [
        {
          code: "DUPLICATE_RESOURCE",
          message: `Invitation for email ${validatedInput.email} already exists`,
          value: validatedInput.email,
        },
      ],
    };
  }

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const [newInvitation] = await db
    .insert(invitation)
    .values({
      organizationId: validatedInput.organizationId,
      email: validatedInput.email,
      role: validatedInput.role,
      status: "pending",
      expiresAt,
      inviterId: request.user.id,
    })
    .returning();

  const inviterName =
    `${request.user.firstName || ""} ${request.user.lastName || ""}`.trim() ||
    "Someone";
  const inviteUrl = `${process.env.CLIENT_ORIGIN || "http://localhost:3000"}/accept-invitation?token=${newInvitation.id}`;

  console.log("=".repeat(60));
  console.log("📧 INVITATION EMAIL");
  console.log("=".repeat(60));
  console.log(`To: ${validatedInput.email}`);
  console.log(`Subject: You've been invited to join ${org.name}`);
  console.log("-".repeat(60));
  console.log(
    `${inviterName} has invited you to join ${org.name} as ${validatedInput.role}.`,
  );
  console.log(`Accept: ${inviteUrl}`);
  console.log("=".repeat(60));

  logger.info("Invitation created", {
    invitationId: newInvitation.id,
    email: validatedInput.email,
    organizationId: validatedInput.organizationId,
  });

  return {
    isSuccess: true,
    data: {
      invitation: {
        id: newInvitation.id,
        email: newInvitation.email,
        role: newInvitation.role || validatedInput.role,
        expiresAt: newInvitation.expiresAt,
      },
    },
  };
}
