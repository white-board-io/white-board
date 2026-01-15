import { db } from "@repo/database";
import { role, permission } from "@repo/database/schema/roles";
import { roles } from "@repo/auth/permissions";
import type { LoggerHelpers } from "../../../plugins/logger";

export async function seedOrganizationRoles(
  organizationId: string,
  logger?: LoggerHelpers
) {
  logger?.info("Seeding roles for organization", { organizationId });

  for (const [roleName, roleDef] of Object.entries(roles)) {
    try {
      // 1. Create the role
      const [createdRole] = await db
        .insert(role)
        .values({
          organizationId,
          name: roleName,
          type: "system",
          description: `System role: ${roleName}`,
        })
        .returning();

      if (!createdRole) {
        logger?.error(`Failed to create role ${roleName}`);
        continue;
      }

      // 2. Create permissions
      // Access statements from the role definition.
      // Based on better-auth access control implementation, statements are available on the role object.
      const statements = (roleDef as any).statements as Record<string, string[]>;

      if (!statements) {
        continue;
      }

      const permissionValues = Object.entries(statements).map(
        ([resource, actions]) => ({
          roleId: createdRole.id,
          resource,
          actions: actions,
        })
      );

      if (permissionValues.length > 0) {
        await db.insert(permission).values(permissionValues);
      }
    } catch (error) {
      logger?.error(`Error seeding role ${roleName}`, { error });
      // Continue with other roles even if one fails
    }
  }

  logger?.info("Roles seeded successfully");
}
