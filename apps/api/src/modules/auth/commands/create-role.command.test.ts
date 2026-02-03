import { describe, it, expect, vi, beforeEach } from "vitest";

const requirePermission = vi.hoisted(() => vi.fn());

vi.mock("../middleware/require-auth.middleware", () => ({ requirePermission }));

const roleRepository = vi.hoisted(() => ({
  create: vi.fn(),
}));

vi.mock("../repository/role.repository", () => ({ roleRepository }));

const roleValidator = vi.hoisted(() => ({
  validateRoleUniqueness: vi.fn(),
}));

vi.mock("../validators/role.validator", () => ({ roleValidator }));

import { createRoleHandler } from "./create-role.command";

describe("createRoleHandler", () => {
  const logger = {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  };
  const organizationId = "b6c7e1b2-5d7a-4e9b-9b0f-9f7a9b1f9c1a";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return forbidden, when permission check fails", async () => {
    requirePermission.mockRejectedValue(new Error("forbidden"));

    const result = await createRoleHandler(
      organizationId,
      { name: "Coach" },
      {} as never,
      logger,
    );

    expect(result.isSuccess).toBe(false);
    expect(result.errors?.[0]?.code).toBe("FORBIDDEN");
  });

  it("should create role, when input is valid", async () => {
    requirePermission.mockResolvedValue(undefined);
    roleValidator.validateRoleUniqueness.mockResolvedValue(undefined);
    roleRepository.create.mockResolvedValue({
      id: "role-1",
      name: "Coach",
      organizationId,
    });

    const result = await createRoleHandler(
      organizationId,
      { name: "Coach" },
      {} as never,
      logger,
    );

    expect(result.isSuccess).toBe(true);
    expect(result.data?.role.id).toBe("role-1");
  });
});
