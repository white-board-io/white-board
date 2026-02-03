import { describe, it, expect, vi, beforeEach } from "vitest";

const db = vi.hoisted(() => ({
  select: vi.fn(),
  update: vi.fn(),
}));
const eq = vi.hoisted(() => vi.fn());

vi.mock("@repo/database", () => ({ db, eq }));

vi.mock("@repo/database/schema/auth", () => ({
  organization: {},
}));

const requirePermission = vi.hoisted(() => vi.fn());

vi.mock("../middleware/require-auth.middleware", () => ({ requirePermission }));

import { deleteOrganizationHandler } from "./delete-organization.command";

describe("deleteOrganizationHandler", () => {
  const logger = {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  };
  const organizationId = "a2e8f4c1-4f25-4a66-8f0d-6b9db9c5c1aa";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return forbidden, when permission check fails", async () => {
    requirePermission.mockRejectedValue(new Error("forbidden"));

    const result = await deleteOrganizationHandler(
      organizationId,
      {} as never,
      logger,
    );

    expect(result.isSuccess).toBe(false);
    expect(result.errors?.[0]?.code).toBe("FORBIDDEN");
  });

  it("should soft delete organization, when organization exists", async () => {
    requirePermission.mockResolvedValue(undefined);

    db.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([
            { id: "org-1", isDeleted: false },
          ]),
        }),
      }),
    });

    db.update.mockReturnValue({
      set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }),
    });

    const result = await deleteOrganizationHandler(
      organizationId,
      {} as never,
      logger,
    );

    expect(result.isSuccess).toBe(true);
    expect(result.data?.success).toBe(true);
  });
});
