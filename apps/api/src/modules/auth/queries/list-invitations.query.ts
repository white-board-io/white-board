import { z } from "zod";
import { db, eq } from "@repo/database";
import { invitation, user, organization } from "@repo/database/schema/auth";
import { OrganizationIdParamSchema } from "../schemas/auth.schema";
import { requirePermission } from "../middleware/require-auth.middleware";
import { createValidationError, createNotFoundError } from "../../../shared/errors/app-error";
import type { FastifyRequest } from "fastify";
import type { LoggerHelpers } from "../../../plugins/logger";

export type InvitationInfo = {
  id: string;
  email: string;
  role: string | null;
  status: string;
  expiresAt: Date;
  inviterEmail: string;
  inviterName: string;
  createdAt: Date;
};

export type ListInvitationsResult = {
  invitations: InvitationInfo[];
};

export async function listInvitationsHandler(
  organizationId: unknown,
  request: FastifyRequest,
  logger: LoggerHelpers
): Promise<ListInvitationsResult> {
  logger.debug("ListInvitationsQuery received", { organizationId });

  const parseResult = OrganizationIdParamSchema.safeParse({ organizationId });
  if (!parseResult.success) {
    const errors = z.flattenError(parseResult.error);
    throw createValidationError({ fieldErrors: errors.fieldErrors });
  }

  const validatedOrgId = parseResult.data.organizationId;

  await requirePermission(request, validatedOrgId, "invitation", "read");

  const [org] = await db
    .select()
    .from(organization)
    .where(eq(organization.id, validatedOrgId))
    .limit(1);

  if (!org || org.isDeleted) {
    throw createNotFoundError("Organization", validatedOrgId);
  }

  const invitationsData = await db
    .select({
      id: invitation.id,
      email: invitation.email,
      role: invitation.role,
      status: invitation.status,
      expiresAt: invitation.expiresAt,
      inviterId: invitation.inviterId,
      inviterEmail: user.email,
      inviterFirstName: user.firstName,
      inviterLastName: user.lastName,
    })
    .from(invitation)
    .innerJoin(user, eq(invitation.inviterId, user.id))
    .where(eq(invitation.organizationId, validatedOrgId));

  const invitations: InvitationInfo[] = invitationsData.map((inv) => ({
    id: inv.id,
    email: inv.email,
    role: inv.role,
    status: inv.status,
    expiresAt: inv.expiresAt,
    inviterEmail: inv.inviterEmail,
    inviterName: `${inv.inviterFirstName || ""} ${inv.inviterLastName || ""}`.trim(),
    createdAt: inv.expiresAt,
  }));

  logger.info("Invitations listed", {
    organizationId: validatedOrgId,
    count: invitations.length,
  });

  return { invitations };
}
