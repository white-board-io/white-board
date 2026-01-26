import { mapZodErrors } from "../../../utils/mapZodErrors";
import { db, eq } from "@repo/database";
import { member, user, organization } from "@repo/database/schema/auth";
import { OrganizationIdParamSchema } from "../schemas/auth.schema";
import { requirePermission } from "../middleware/require-auth.middleware";
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

import type { ServiceResult } from "../../../utils/ServiceResult";

export type ListMembersResult = ServiceResult<{
  members: MemberInfo[];
}>;

export async function listMembersHandler(
  organizationId: unknown,
  request: FastifyRequest,
  logger: LoggerHelpers,
): Promise<ListMembersResult> {
  logger.debug("ListMembersQuery received", { organizationId });

  const parseResult = OrganizationIdParamSchema.safeParse({ organizationId });
  if (!parseResult.success) {
    return {
      isSuccess: false,
      errors: mapZodErrors(parseResult.error),
    };
  }

  const validatedOrgId = parseResult.data.organizationId;

  try {
    await requirePermission(request, validatedOrgId, "member", "read");
  } catch {
    return {
      isSuccess: false,
      errors: [
        {
          code: "FORBIDDEN",
          message: "Insufficient permissions to read members",
        },
      ],
    };
  }

  const [org] = await db
    .select()
    .from(organization)
    .where(eq(organization.id, validatedOrgId))
    .limit(1);

  if (!org || org.isDeleted) {
    return {
      isSuccess: false,
      errors: [
        {
          code: "RESOURCE_NOT_FOUND",
          message: `Organization ${validatedOrgId} not found`,
          value: validatedOrgId,
        },
      ],
    };
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

  return { isSuccess: true, data: { members } };
}
