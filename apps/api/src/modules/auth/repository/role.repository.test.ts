import { beforeEach, describe, expect, it } from "vitest";
import { db, eq } from "@repo/database";
import { organization } from "@repo/database/schema/auth";
import { permission, role } from "@repo/database/schema/roles";
import { roleRepository } from "./role.repository";

const createOrganization = async () => {
  const [org] = await db
    .insert(organization)
    .values({
      name: "Acme Org",
      organizationType: "other",
    })
    .returning();
  return org;
};

describe("roleRepository", () => {
  beforeEach(async () => {
    await db.delete(permission);
    await db.delete(role);
    await db.delete(organization);
  });

  it("creates roles with permissions", async () => {
    const org = await createOrganization();

    const created = await roleRepository.create(org.id, {
      name: "Editor",
      description: "Can edit",
      permissions: [
        { resource: "todo", actions: ["read", "write"] },
      ],
    });

    const perms = await db
      .select()
      .from(permission)
      .where(eq(permission.roleId, created.id));

    expect(perms).toHaveLength(1);
    expect(perms[0]?.resource).toBe("todo");
  });

  it("finds roles with permissions", async () => {
    const org = await createOrganization();
    const created = await roleRepository.create(org.id, {
      name: "Manager",
      description: "Manages stuff",
      permissions: [
        { resource: "todo", actions: ["read"] },
        { resource: "member", actions: ["invite"] },
      ],
    });

    const found = await roleRepository.findByIdWithPermissions(
      org.id,
      created.id,
    );

    expect(found?.permissions).toHaveLength(2);
  });

  it("updates permissions by replacing existing rows", async () => {
    const org = await createOrganization();
    const created = await roleRepository.create(org.id, {
      name: "Reviewer",
      description: "Reviews",
      permissions: [{ resource: "todo", actions: ["read"] }],
    });

    await roleRepository.updatePermissions(org.id, created.id, [
      { resource: "todo", actions: ["read", "comment"] },
    ]);

    const found = await roleRepository.findByIdWithPermissions(
      org.id,
      created.id,
    );

    expect(found?.permissions).toHaveLength(1);
    expect(found?.permissions[0]?.actions).toEqual(["read", "comment"]);
  });

  it("lists roles by organization", async () => {
    const org = await createOrganization();
    await roleRepository.create(org.id, {
      name: "Admin",
      description: "Admin",
      permissions: [{ resource: "org", actions: ["manage"] }],
    });
    await roleRepository.create(org.id, {
      name: "Viewer",
      description: "Viewer",
      permissions: [],
    });

    const list = await roleRepository.listByOrg(org.id);

    expect(list).toHaveLength(2);
    const names = list.map((item) => item.name).sort();
    expect(names).toEqual(["Admin", "Viewer"]);
  });

  it("deletes roles and their permissions", async () => {
    const org = await createOrganization();
    const created = await roleRepository.create(org.id, {
      name: "Temp",
      description: "Temp role",
      permissions: [{ resource: "todo", actions: ["read"] }],
    });

    await roleRepository.delete(org.id, created.id);

    const found = await roleRepository.findById(org.id, created.id);
    expect(found).toBeUndefined();

    const perms = await db
      .select()
      .from(permission)
      .where(eq(permission.roleId, created.id));
    expect(perms).toHaveLength(0);
  });
});
