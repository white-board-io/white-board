import { role, permission, type RoleEntity } from "@repo/database/schema/roles";
import { roles } from "@repo/auth/permissions";
import type { LoggerHelpers } from "../../../plugins/logger";

export async function seedOrganizationRoles(
  organizationId: string,
  logger?: LoggerHelpers,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tx?: any,
) {
  logger?.info("Seeding roles for organization", { organizationId });

  const database = tx || (await import("@repo/database")).db;

  const roleEntries = Object.entries(roles);
  const roleValues = roleEntries.map(([roleName]) => ({
    organizationId,
    name: roleName,
    type: "system",
    description: `System role: ${roleName}`,
  }));

  const createdRoles = await database
    .insert(role)
    .values(roleValues)
    .returning();

  const rolesByName = new Map<string, RoleEntity>(
    createdRoles.map((r: RoleEntity) => [r.name, r]),
  );

  const permissionValues = [];
  for (const [roleName, roleDef] of roleEntries) {
    const createdRole = rolesByName.get(roleName);
    if (!createdRole) continue;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const statements = (roleDef as any).statements as Record<string, string[]>;

    if (statements) {
      const rolePermissions = Object.entries(statements).map(
        ([resource, actions]) => ({
          roleId: createdRole.id,
          resource,
          actions,
        }),
      );
      permissionValues.push(...rolePermissions);
    }
  }

  if (permissionValues.length > 0) {
    await database.insert(permission).values(permissionValues);
  }

  logger?.info("Roles seeded successfully");
}
