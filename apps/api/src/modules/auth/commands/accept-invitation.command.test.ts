import { describe, it, expect, vi, beforeEach } from "vitest";

const db = vi.hoisted(() => ({
  select: vi.fn(),
  insert: vi.fn(),
  update: vi.fn(),
}));
const eq = vi.hoisted(() => vi.fn());

vi.mock("@repo/database", () => ({ db, eq }));

vi.mock("@repo/database/schema/auth", () => ({
  invitation: {},
  member: {},
  organization: {},
}));

import { acceptInvitationHandler } from "./accept-invitation.command";

describe("acceptInvitationHandler", () => {
  const logger = {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return unauthorized, when request has no user", async () => {
    const result = await acceptInvitationHandler(
      { invitationId: "inv-1" },
      {} as never,
      logger,
    );

    expect(result.isSuccess).toBe(false);
    if (!result.isSuccess) {
      expect(result.errors?.[0]?.code).toBe("UNAUTHORIZED");
    }
  });

  it("should return validation errors, when invitation id is missing", async () => {
    const result = await acceptInvitationHandler(
      {},
      { user: { id: "user-1", email: "user@example.com" } } as never,
      logger,
    );

    expect(result.isSuccess).toBe(false);
    if (!result.isSuccess) {
      expect(result.errors?.length).toBeGreaterThan(0);
    }
  });

  it("should accept invitation, when invitation is valid", async () => {
    const invitationRecord = {
      id: "inv-1",
      email: "user@example.com",
      status: "pending",
      expiresAt: new Date(Date.now() + 1000 * 60 * 60),
      organizationId: "org-1",
      role: "teacher",
    };

    const org = { id: "org-1", name: "Acme", isDeleted: false };

    db.select
      .mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([invitationRecord]),
          }),
        }),
      })
      .mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([org]),
          }),
        }),
      });

    db.insert.mockReturnValue({
      values: vi.fn().mockResolvedValue(undefined),
    });

    db.update.mockReturnValue({
      set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }),
    });

    const result = await acceptInvitationHandler(
      { invitationId: "inv-1" },
      { user: { id: "user-1", email: "user@example.com" } } as never,
      logger,
    );

    expect(result.isSuccess).toBe(true);
    if (result.isSuccess) {
      expect(result.data?.organization.id).toBe("org-1");
    }
  });
});
