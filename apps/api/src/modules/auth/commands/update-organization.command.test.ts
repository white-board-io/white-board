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

import { updateOrganizationHandler } from "./update-organization.command";

describe("updateOrganizationHandler", () => {
  const logger = {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  };
  const organizationId = "c1d2e3f4-5a6b-4c7d-8e9f-0a1b2c3d4e5f";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return not found, when organization is missing", async () => {
    requirePermission.mockResolvedValue(undefined);

    db.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([]),
        }),
      }),
    });

    const result = await updateOrganizationHandler(
      organizationId,
      { name: "Acme" },
      {} as never,
      logger,
    );

    expect(result.isSuccess).toBe(false);
    expect(result.errors?.[0]?.code).toBe("RESOURCE_NOT_FOUND");
  });

  it("should update organization, when input is valid", async () => {
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
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([
            {
              id: "org-1",
              name: "Acme",
              slug: "acme",
              organizationType: "school",
            },
          ]),
        }),
      }),
    });

    const result = await updateOrganizationHandler(
      organizationId,
      { name: "Acme" },
      {} as never,
      logger,
    );

    expect(result.isSuccess).toBe(true);
    expect(result.data?.organization.id).toBe("org-1");
  });
});
