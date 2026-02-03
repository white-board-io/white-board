import { describe, it, expect, vi, beforeEach } from "vitest";

const requirePermission = vi.hoisted(() => vi.fn());

vi.mock("../middleware/require-auth.middleware", () => ({ requirePermission }));

const roleRepository = vi.hoisted(() => ({
  findById: vi.fn(),
  updatePermissions: vi.fn(),
}));

vi.mock("../repository/role.repository", () => ({ roleRepository }));

import { updateRolePermissionsHandler } from "./update-role-permissions.command";

describe("updateRolePermissionsHandler", () => {
  const logger = {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  };
  const organizationId = "d1e2f3a4-b5c6-4d7e-8f90-1a2b3c4d5e6f";
  const roleId = "e2f3a4b5-c6d7-4e8f-901a-2b3c4d5e6f70";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return validation errors, when ids are invalid", async () => {
    const result = await updateRolePermissionsHandler(
      "bad",
      "also-bad",
      { permissions: [] },
      {} as never,
      logger,
    );

    expect(result.isSuccess).toBe(false);
    expect(result.errors?.length).toBeGreaterThan(0);
  });

  it("should update permissions, when role exists", async () => {
    requirePermission.mockResolvedValue(undefined);
    roleRepository.findById.mockResolvedValue({ id: "role-1" });

    const result = await updateRolePermissionsHandler(
      organizationId,
      roleId,
      { permissions: [{ resource: "todo", actions: ["read"] }] },
      {} as never,
      logger,
    );

    expect(result.isSuccess).toBe(true);
    expect(roleRepository.updatePermissions).toHaveBeenCalled();
  });
});
