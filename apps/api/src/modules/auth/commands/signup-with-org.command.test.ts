import { describe, it, expect, vi, beforeEach } from "vitest";

const signUpEmail = vi.hoisted(() => vi.fn());

vi.mock("@repo/auth", () => ({
  auth: {
    api: {
      signUpEmail,
    },
  },
}));

const db = vi.hoisted(() => ({
  query: {
    user: {
      findFirst: vi.fn(),
    },
  },
  transaction: vi.fn(),
  update: vi.fn(),
}));

const eq = vi.hoisted(() => vi.fn());

vi.mock("@repo/database", () => ({ db, eq }));

vi.mock("@repo/database/schema/auth", () => ({
  organization: {},
  member: {},
  session: {},
  user: {},
}));

const seedOrganizationRoles = vi.hoisted(() => vi.fn());

vi.mock("../utils/seed-roles", () => ({ seedOrganizationRoles }));

import { signUpWithOrgHandler } from "./signup-with-org.command";

describe("signUpWithOrgHandler", () => {
  const logger = {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return error, when user already exists", async () => {
    db.query.user.findFirst.mockResolvedValue({ id: "user-1" });

    const result = await signUpWithOrgHandler(
      {
        firstName: "Test",
        lastName: "User",
        email: "user@example.com",
        password: "password123",
        organizationName: "Acme",
        organizationType: "school",
      },
      new Headers(),
      logger,
    );

    expect(result.isSuccess).toBe(false);
    expect(result.errors?.[0]?.code).toBe("USER_ALREADY_EXISTS");
  });

  it("should create organization and user, when input is valid", async () => {
    db.query.user.findFirst.mockResolvedValue(null);

    const response = {
      headers: new Headers(),
      json: vi.fn().mockResolvedValue({
        user: { id: "user-1", email: "user@example.com", name: "Test User" },
      }),
    };

    signUpEmail.mockResolvedValue(response);

    const newOrg = {
      id: "org-1",
      name: "Acme",
      slug: "acme-123",
      organizationType: "school",
    };

    const tx = {
      insert: vi
        .fn()
        .mockReturnValueOnce({
          values: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([newOrg]),
          }),
        })
        .mockReturnValueOnce({
          values: vi.fn().mockResolvedValue(undefined),
        }),
    };

    db.transaction.mockImplementation(async (cb: (t: typeof tx) => unknown) =>
      cb(tx),
    );

    db.update.mockReturnValue({
      set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }),
    });

    const result = await signUpWithOrgHandler(
      {
        firstName: "Test",
        lastName: "User",
        email: "user@example.com",
        password: "password123",
        organizationName: "Acme",
        organizationType: "school",
      },
      new Headers(),
      logger,
    );

    expect(result.isSuccess).toBe(true);
    expect(result.data?.organization.id).toBe("org-1");
    expect(seedOrganizationRoles).toHaveBeenCalled();
  });
});
