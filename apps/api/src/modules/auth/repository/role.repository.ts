import { db, eq, and } from "@repo/database";
import { role, permission } from "@repo/database/schema/roles";
import type { CreateRoleInput } from "../schemas/role.schema";

export const roleRepository = {
  create: async (organizationId: string, input: CreateRoleInput) => {
    const [newRole] = await db
      .insert(role)
      .values({
        organizationId,
        name: input.name,
        type: "custom",
        description: input.description,
      })
      .returning();

    if (input.permissions && input.permissions.length > 0) {
      const permissionValues = input.permissions.map((p) => ({
        roleId: newRole.id,
        resource: p.resource,
        actions: p.actions,
      }));
      await db.insert(permission).values(permissionValues);
    }

    return newRole;
  },

  updatePermissions: async (
    organizationId: string,
    roleId: string,
    permissions: { resource: string; actions: string[] }[]
  ) => {
    await db.transaction(async (tx) => {
      await tx.delete(permission).where(eq(permission.roleId, roleId));

      if (permissions.length > 0) {
        const permissionValues = permissions.map((p) => ({
          roleId: roleId,
          resource: p.resource,
          actions: p.actions,
        }));
        await tx.insert(permission).values(permissionValues);
      }
    });
  },

  delete: async (organizationId: string, roleId: string) => {
    await db.delete(role).where(and(eq(role.id, roleId), eq(role.organizationId, organizationId)));
  },

  findById: async (organizationId: string, roleId: string) => {
    const [foundRole] = await db
      .select()
      .from(role)
      .where(and(eq(role.id, roleId), eq(role.organizationId, organizationId)))
      .limit(1);
    return foundRole;
  },

  findByName: async (organizationId: string, name: string) => {
    const [foundRole] = await db
      .select()
      .from(role)
      .where(and(eq(role.organizationId, organizationId), eq(role.name, name)))
      .limit(1);
    return foundRole;
  },

  listByOrg: async (organizationId: string) => {
    const rows = await db
      .select({
          role: role,
          permission: permission,
      })
      .from(role)
      .leftJoin(permission, eq(role.id, permission.roleId))
      .where(eq(role.organizationId, organizationId));

    return rows;
  }
};
