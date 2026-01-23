import type { FastifyRequest, FastifyReply } from "fastify";
import { createUnauthorizedError, createForbiddenError } from "../../../shared/errors/app-error";
import { db, eq, and } from "@repo/database";
import { member } from "@repo/database/schema/auth";
import { statement, type RoleName } from "@repo/auth/permissions";
import {permission, role} from "@repo/database/schema/roles";

export async function requireAuth(request: FastifyRequest) {
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

export async function hasPermission(
    organizationId: string,
    roleName: string,
    resource: string,
    action: string
): Promise<boolean> {
    const [perm] = await db
        .select({
            actions: permission.actions,
        })
        .from(role)
        .innerJoin(permission, eq(role.id, permission.roleId))
        .where(
            and(
                eq(role.organizationId, organizationId),
                eq(role.name, roleName),
                eq(permission.resource, resource)
            )
        )
        .limit(1);

    if (!perm) return false;

    // actions is jsonb, typed as string[] in schema definition
    const actions = perm.actions as string[];
    return actions.includes(action);
}

export async function requirePermission(
  request: FastifyRequest,
  organizationId: string,
  resource: Resource,
  action: Action
): Promise<{ role: RoleName; memberId: string }> {
  const membership = await requireOrgMembership(request, organizationId);
  const allowed = await hasPermission(organizationId, membership.role, resource, action);

  if (!allowed) {
      throw createForbiddenError("ERR_INSUFFICIENT_PERMISSIONS");
  }

  return membership;
}
