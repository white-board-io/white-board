import { describe, it, expect, vi, beforeEach } from "vitest";

const requirePermission = vi.hoisted(() => vi.fn());

vi.mock("../middleware/require-auth.middleware", () => ({ requirePermission }));

const roleRepository = vi.hoisted(() => ({
  findById: vi.fn(),
  delete: vi.fn(),
}));

vi.mock("../repository/role.repository", () => ({ roleRepository }));

const roleValidator = vi.hoisted(() => ({
  validateSystemRoleDeletion: vi.fn(),
}));

vi.mock("../validators/role.validator", () => ({ roleValidator }));

import { deleteRoleHandler } from "./delete-role.command";

describe("deleteRoleHandler", () => {
  const logger = {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  };
  const organizationId = "e1a6d9b2-6c3f-4b9a-9d3a-7c1a1a3d5e6f";
  const roleId = "c4b8d2a1-2f4c-4b0f-9a6a-1b2c3d4e5f60";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return not found, when role does not exist", async () => {
    requirePermission.mockResolvedValue(undefined);
    roleRepository.findById.mockResolvedValue(null);

    const result = await deleteRoleHandler(
      organizationId,
      roleId,
      {} as never,
      logger,
    );

    expect(result.isSuccess).toBe(false);
    if (!result.isSuccess) {
      expect(result.errors?.[0]?.code).toBe("RESOURCE_NOT_FOUND");
    }
  });

  it("should return validation errors, when ids are invalid", async () => {
    const result = await deleteRoleHandler(
      "bad",
      "bad",
      {} as never,
      logger,
    );

    expect(result.isSuccess).toBe(false);
    if (!result.isSuccess) {
      expect(result.errors?.length).toBeGreaterThan(0);
    }
  });

  it("should delete role, when role is valid", async () => {
    requirePermission.mockResolvedValue(undefined);
    roleRepository.findById.mockResolvedValue({ id: "role-1", type: "custom" });
    roleValidator.validateSystemRoleDeletion.mockReturnValue(undefined);

    const result = await deleteRoleHandler(
      organizationId,
      roleId,
      {} as never,
      logger,
    );

    expect(result.isSuccess).toBe(true);
    expect(roleRepository.delete).toHaveBeenCalled();
  });
});
