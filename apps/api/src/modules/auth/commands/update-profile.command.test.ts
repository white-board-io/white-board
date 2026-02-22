import { describe, it, expect, vi, beforeEach } from "vitest";

const getSession = vi.hoisted(() => vi.fn());

vi.mock("@repo/auth", () => ({
  auth: {
    api: {
      getSession,
    },
  },
}));

const db = vi.hoisted(() => ({
  update: vi.fn(),
  select: vi.fn(),
}));
const eq = vi.hoisted(() => vi.fn());

vi.mock("@repo/database", () => ({ db, eq }));

vi.mock("@repo/database/schema/auth", () => ({
  user: {},
}));

import { updateProfileHandler } from "./update-profile.command";

describe("updateProfileHandler", () => {
  const logger = {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return unauthorized, when session is missing", async () => {
    getSession.mockResolvedValue(null);

    const result = await updateProfileHandler(
      { firstName: "Test" },
      new Headers(),
      logger,
    );

    expect(result.isSuccess).toBe(false);
    if (!result.isSuccess) {
      expect(result.errors?.[0]?.code).toBe("UNAUTHORIZED");
    }
  });

  it("should return validation errors, when input is invalid", async () => {
    getSession.mockResolvedValue({ user: { id: "user-1" } });

    const result = await updateProfileHandler(
      { image: "not-a-url" },
      new Headers(),
      logger,
    );

    expect(result.isSuccess).toBe(false);
    if (!result.isSuccess) {
      expect(result.errors?.[0]?.code).toBe("IMAGE_URL_INVALID");
    }
  });

  it("should update profile, when session is present", async () => {
    getSession.mockResolvedValue({ user: { id: "user-1" } });

    db.update.mockReturnValue({
      set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }),
    });

    db.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([
            {
              id: "user-1",
              email: "user@example.com",
              firstName: "Test",
              lastName: "User",
              image: null,
            },
          ]),
        }),
      }),
    });

    const result = await updateProfileHandler(
      { firstName: "Test" },
      new Headers(),
      logger,
    );

    expect(result.isSuccess).toBe(true);
    if (result.isSuccess) {
      expect(result.data?.user.id).toBe("user-1");
    }
  });
});
