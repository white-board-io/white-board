import { describe, it, expect, vi, beforeEach } from "vitest";

const setActiveOrganization = vi.hoisted(() => vi.fn());

vi.mock("@repo/auth", () => ({
  auth: {
    api: {
      setActiveOrganization,
    },
  },
}));

const requireOrgMembership = vi.hoisted(() => vi.fn());

vi.mock("../middleware/require-auth.middleware", () => ({
  requireOrgMembership,
}));

import { switchOrganizationHandler } from "./switch-organization.command";

describe("switchOrganizationHandler", () => {
  const logger = {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  };
  const organizationId = "f2a3b4c5-d6e7-4f80-9a1b-2c3d4e5f6071";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return unauthorized, when request has no user", async () => {
    const result = await switchOrganizationHandler(
      organizationId,
      {} as never,
      new Headers(),
      logger,
    );

    expect(result.isSuccess).toBe(false);
    if (!result.isSuccess) {
      expect(result.errors?.[0]?.code).toBe("UNAUTHORIZED");
    }
  });

  it("should return validation errors, when organization id is invalid", async () => {
    const result = await switchOrganizationHandler(
      "bad",
      { user: { id: "user-1" } } as never,
      new Headers(),
      logger,
    );

    expect(result.isSuccess).toBe(false);
    if (!result.isSuccess) {
      expect(result.errors?.[0]?.code).toBe("ORGANIZATION_ID_INVALID");
    }
  });

  it("should switch organization, when user is a member", async () => {
    requireOrgMembership.mockResolvedValue(undefined);

    const result = await switchOrganizationHandler(
      organizationId,
      { user: { id: "user-1" } } as never,
      new Headers(),
      logger,
    );

    expect(result.isSuccess).toBe(true);
    if (result.isSuccess) {
      expect(result.data?.activeOrganizationId).toBe(organizationId);
    }
  });
});
