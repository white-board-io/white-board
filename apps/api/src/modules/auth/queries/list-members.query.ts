import { z } from "zod";
import { db, eq } from "@repo/database";
import { member, user, organization } from "@repo/database/schema/auth";
import { OrganizationIdParamSchema } from "../schemas/auth.schema";
import { requirePermission } from "../middleware/require-auth.middleware";
import { createValidationError, createNotFoundError } from "../../../shared/errors/app-error";
import type { FastifyRequest } from "fastify";
import type { LoggerHelpers } from "../../../plugins/logger";

export type MemberInfo = {
  id: string;
  userId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
  joinedAt: Date;
};

export type ListMembersResult = {
  members: MemberInfo[];
};

export async function listMembersHandler(
  organizationId: unknown,
  request: FastifyRequest,
  logger: LoggerHelpers
): Promise<ListMembersResult> {
  logger.debug("ListMembersQuery received", { organizationId });

  const parseResult = OrganizationIdParamSchema.safeParse({ organizationId });
  if (!parseResult.success) {
    const errors = z.flattenError(parseResult.error);
    throw createValidationError({ fieldErrors: errors.fieldErrors });
  }

  const validatedOrgId = parseResult.data.organizationId;

  await requirePermission(request, validatedOrgId, "member", "read");

  const [org] = await db
    .select()
    .from(organization)
    .where(eq(organization.id, validatedOrgId))
    .limit(1);

  if (!org || org.isDeleted) {
    throw createNotFoundError("Organization", validatedOrgId);
  }

  const membersData = await db
    .select({
      memberId: member.id,
      userId: member.userId,
      role: member.role,
      createdAt: member.createdAt,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isDeleted: user.isDeleted,
    })
    .from(member)
    .innerJoin(user, eq(member.userId, user.id))
    .where(eq(member.organizationId, validatedOrgId));

  const activeMembers = membersData.filter((m) => !m.isDeleted);

  const members: MemberInfo[] = activeMembers.map((m) => ({
    id: m.memberId,
    userId: m.userId,
    email: m.email,
    firstName: m.firstName,
    lastName: m.lastName,
    role: m.role,
    joinedAt: m.createdAt,
  }));

  logger.info("Members listed", {
    organizationId: validatedOrgId,
    count: members.length,
  });

  return { members };
}
