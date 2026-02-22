import { describe, it, expect, vi, beforeEach } from "vitest";

const db = vi.hoisted(() => ({
  select: vi.fn(),
  update: vi.fn(),
}));
const eq = vi.hoisted(() => vi.fn());
const and = vi.hoisted(() => vi.fn());

vi.mock("@repo/database", () => ({ db, eq, and }));

vi.mock("@repo/database/schema/auth", () => ({
  invitation: {},
}));

const requirePermission = vi.hoisted(() => vi.fn());

vi.mock("../middleware/require-auth.middleware", () => ({ requirePermission }));

import { cancelInvitationHandler } from "./cancel-invitation.command";

describe("cancelInvitationHandler", () => {
  const logger = {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  };
  const invitationId = "d2b5c6e1-4b3a-4a8f-8c2b-0c4a9f3c7e21";
  const organizationId = "f1a2b3c4-5d6e-4f70-8a9b-0c1d2e3f4a5b";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return forbidden, when permission check fails", async () => {
    requirePermission.mockRejectedValue(new Error("forbidden"));

    const result = await cancelInvitationHandler(
      {
        invitationId,
        organizationId,
      },
      {} as never,
      logger,
    );

    expect(result.isSuccess).toBe(false);
    if (!result.isSuccess) {
      expect(result.errors?.[0]?.code).toBe("FORBIDDEN");
    }
  });

  it("should return validation errors, when input is invalid", async () => {
    const result = await cancelInvitationHandler(
      { invitationId: "bad", organizationId: "bad" },
      {} as never,
      logger,
    );

    expect(result.isSuccess).toBe(false);
    if (!result.isSuccess) {
      expect(result.errors?.length).toBeGreaterThan(0);
    }
  });

  it("should cancel invitation, when invitation is pending", async () => {
    requirePermission.mockResolvedValue(undefined);

    db.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([
            { id: "inv-1", status: "pending" },
          ]),
        }),
      }),
    });

    db.update.mockReturnValue({
      set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }),
    });

    const result = await cancelInvitationHandler(
      {
        invitationId,
        organizationId,
      },
      {} as never,
      logger,
    );

    expect(result.isSuccess).toBe(true);
    if (result.isSuccess) {
      expect(result.data?.success).toBe(true);
    }
  });
});
