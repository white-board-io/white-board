import { describe, it, expect, vi, beforeEach } from "vitest";

const db = vi.hoisted(() => ({
  select: vi.fn(),
  insert: vi.fn(),
}));
const eq = vi.hoisted(() => vi.fn());
const and = vi.hoisted(() => vi.fn());

vi.mock("@repo/database", () => ({ db, eq, and }));

vi.mock("@repo/database/schema/auth", () => ({
  invitation: {},
  member: {},
  user: {},
  organization: {},
}));

const requirePermission = vi.hoisted(() => vi.fn());

vi.mock("../middleware/require-auth.middleware", () => ({ requirePermission }));

const roleValidator = vi.hoisted(() => ({
  validateRoleExists: vi.fn(),
}));

vi.mock("../validators/role.validator", () => ({ roleValidator }));

import { inviteMemberHandler } from "./invite-member.command";

describe("inviteMemberHandler", () => {
  const logger = {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  };
  const organizationId = "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d";

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "log").mockImplementation(() => undefined);
  });

  it("should return unauthorized, when request has no user", async () => {
    const result = await inviteMemberHandler(
      {
        email: "user@example.com",
        role: "teacher",
        organizationId,
      },
      {} as never,
      logger,
    );

    expect(result.isSuccess).toBe(false);
    if (!result.isSuccess) {
      expect(result.errors?.[0]?.code).toBe("UNAUTHORIZED");
    }
  });

  it("should return validation errors, when input is invalid", async () => {
    const result = await inviteMemberHandler(
      { email: "bad", role: "", organizationId: "bad" },
      { user: { id: "user-1" } } as never,
      logger,
    );

    expect(result.isSuccess).toBe(false);
    if (!result.isSuccess) {
      expect(result.errors?.length).toBeGreaterThan(0);
    }
  });

  it("should create invitation, when input is valid", async () => {
    requirePermission.mockResolvedValue(undefined);
    roleValidator.validateRoleExists.mockResolvedValue(undefined);

    db.select
      .mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ id: "org-1", name: "Acme", isDeleted: false }]),
          }),
        }),
      })
      .mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      })
      .mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      });

    db.insert.mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([
          {
            id: "inv-1",
            email: "user@example.com",
            role: "teacher",
            expiresAt: new Date(),
          },
        ]),
      }),
    });

    const result = await inviteMemberHandler(
      {
        email: "user@example.com",
        role: "teacher",
        organizationId,
      },
      {
        user: { id: "user-1", firstName: "Test", lastName: "User" },
      } as never,
      logger,
    );

    expect(result.isSuccess).toBe(true);
    if (result.isSuccess) {
      expect(result.data?.invitation.id).toBe("inv-1");
    }
  });
});
