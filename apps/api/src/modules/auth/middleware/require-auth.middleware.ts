import type { FastifyRequest, FastifyReply } from "fastify";
import { createUnauthorizedError, createForbiddenError } from "../../../shared/errors/app-error";
import { db, eq, and } from "@repo/database";
import { member } from "@repo/database/schema/auth";
import { roles, statement, type RoleName } from "@repo/auth/permissions";

export async function requireAuth(request: FastifyRequest, _reply: FastifyReply) {
  if (!request.user || !request.session) {
    throw createUnauthorizedError();
  }
}

export async function requireOrgMembership(
  request: FastifyRequest,
  organizationId: string
): Promise<{ role: RoleName; memberId: string }> {
  if (!request.user) {
    throw createUnauthorizedError();
  }

  const memberRecord = await db
    .select()
    .from(member)
    .where(
      and(
        eq(member.userId, request.user.id),
        eq(member.organizationId, organizationId)
      )
    )
    .limit(1);

  if (memberRecord.length === 0) {
    throw createForbiddenError("User is not a member of this organization");
  }

  return {
    role: memberRecord[0].role as RoleName,
    memberId: memberRecord[0].id,
  };
}

type Resource = keyof typeof statement;
type Action = string;

export function hasPermission(
  roleName: RoleName,
  resource: Resource,
  action: Action
): boolean {
  const role = roles[roleName];
  if (!role) return false;

  const roleStatements = role.statements as Record<string, readonly string[]>;
  const permissions = roleStatements[resource];
  if (!permissions) return false;

  return permissions.includes(action);
}

export async function requirePermission(
  request: FastifyRequest,
  organizationId: string,
  resource: Resource,
  action: Action
): Promise<{ role: RoleName; memberId: string }> {
  const membership = await requireOrgMembership(request, organizationId);

  if (!hasPermission(membership.role, resource, action)) {
    throw createForbiddenError(
      `Role '${membership.role}' does not have '${action}' permission on '${resource}'`
    );
  }

  return membership;
}
