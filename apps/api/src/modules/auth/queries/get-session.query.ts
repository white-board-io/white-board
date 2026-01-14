import { auth } from "@repo/auth";
import { db, eq } from "@repo/database";
import { member, organization } from "@repo/database/schema/auth";
import { createUnauthorizedError } from "../../../shared/errors/app-error";
import type { LoggerHelpers } from "../../../plugins/logger";

export type OrganizationWithRole = {
  id: string;
  name: string;
  slug: string | null;
  organizationType: string;
  role: string;
  logo: string | null;
};

export type GetSessionResult = {
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    emailVerified: boolean;
    image: string | null;
  };
  organizations: OrganizationWithRole[];
  activeOrganizationId: string | null;
};

export async function getSessionHandler(
  headers: Headers,
  logger: LoggerHelpers
): Promise<GetSessionResult> {
  logger.debug("GetSessionQuery received");

  const session = await auth.api.getSession({ headers });

  if (!session) {
    throw createUnauthorizedError();
  }

  const userOrganizations = await db
    .select({
      organizationId: member.organizationId,
      role: member.role,
      orgName: organization.name,
      orgSlug: organization.slug,
      orgType: organization.organizationType,
      orgLogo: organization.logo,
      isDeleted: organization.isDeleted,
    })
    .from(member)
    .innerJoin(organization, eq(member.organizationId, organization.id))
    .where(eq(member.userId, session.user.id));

  const activeOrganizations = userOrganizations.filter((org) => !org.isDeleted);

  const organizations: OrganizationWithRole[] = activeOrganizations.map((org) => ({
    id: org.organizationId,
    name: org.orgName,
    slug: org.orgSlug,
    organizationType: org.orgType,
    role: org.role,
    logo: org.orgLogo,
  }));

  logger.info("Session retrieved", {
    userId: session.user.id,
    organizationCount: organizations.length,
  });

  return {
    user: {
      id: session.user.id,
      email: session.user.email,
      firstName: session.user.firstName ?? null,
      lastName: session.user.lastName ?? null,
      emailVerified: session.user.emailVerified,
      image: session.user.image ?? null,
    },
    organizations,
    activeOrganizationId: session.session.activeOrganizationId ?? null,
  };
}
