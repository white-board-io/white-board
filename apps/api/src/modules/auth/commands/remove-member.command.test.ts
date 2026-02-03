import { describe, it, expect, vi, beforeEach } from "vitest";

const db = vi.hoisted(() => ({
  select: vi.fn(),
  delete: vi.fn(),
}));
const eq = vi.hoisted(() => vi.fn());
const and = vi.hoisted(() => vi.fn());

vi.mock("@repo/database", () => ({ db, eq, and }));

vi.mock("@repo/database/schema/auth", () => ({
  member: {},
}));

const requirePermission = vi.hoisted(() => vi.fn());

vi.mock("../middleware/require-auth.middleware", () => ({ requirePermission }));

import { removeMemberHandler } from "./remove-member.command";

describe("removeMemberHandler", () => {
  const logger = {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  };
  const memberId = "a3b4c5d6-7e8f-4a9b-8c7d-6e5f4a3b2c1d";
  const organizationId = "b1c2d3e4-f5a6-4b7c-8d9e-0f1a2b3c4d5e";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return forbidden, when permission check fails", async () => {
    requirePermission.mockRejectedValue(new Error("forbidden"));

    const result = await removeMemberHandler(
      {
        memberId,
        organizationId,
      },
      {} as never,
      logger,
    );

    expect(result.isSuccess).toBe(false);
    expect(result.errors?.[0]?.code).toBe("FORBIDDEN");
  });

  it("should remove member, when member exists and not last owner", async () => {
    requirePermission.mockResolvedValue(undefined);

    db.select
      .mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ id: "m-1", role: "teacher" }]),
          }),
        }),
      });

    db.delete.mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) });

    const result = await removeMemberHandler(
      {
        memberId,
        organizationId,
      },
      {} as never,
      logger,
    );

    expect(result.isSuccess).toBe(true);
    expect(result.data?.success).toBe(true);
  });
});
