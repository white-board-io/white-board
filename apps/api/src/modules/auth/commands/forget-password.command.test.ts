import { describe, it, expect, vi, beforeEach } from "vitest";

const cryptoMock = vi.hoisted(() => ({
  randomBytes: vi.fn(() => Buffer.from("token")),
  randomUUID: vi.fn(() => "uuid-1"),
}));

vi.mock("crypto", () => ({
  default: cryptoMock,
  randomBytes: cryptoMock.randomBytes,
  randomUUID: cryptoMock.randomUUID,
}));

const db = vi.hoisted(() => ({
  select: vi.fn(),
  insert: vi.fn(),
}));
const eq = vi.hoisted(() => vi.fn());

vi.mock("@repo/database", () => ({ db, eq }));

vi.mock("@repo/database/schema/auth", () => ({
  user: {},
  verification: {},
}));

import { forgetPasswordHandler } from "./forget-password.command";

describe("forgetPasswordHandler", () => {
  const logger = {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "log").mockImplementation(() => undefined);
  });

  it("should return success, when user does not exist", async () => {
    db.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([]),
        }),
      }),
    });

    const result = await forgetPasswordHandler(
      { email: "missing@example.com" },
      logger,
    );

    expect(result.isSuccess).toBe(true);
    if (result.isSuccess) {
      expect(result.data?.success).toBe(true);
    }
  });

  it("should return validation errors, when email is invalid", async () => {
    const result = await forgetPasswordHandler({ email: "bad" }, logger);

    expect(result.isSuccess).toBe(false);
    if (!result.isSuccess) {
      expect(result.errors?.length).toBeGreaterThan(0);
    }
  });

  it("should create reset token, when user exists", async () => {
    db.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([{ id: "user-1" }]),
        }),
      }),
    });

    db.insert.mockReturnValue({ values: vi.fn().mockResolvedValue(undefined) });

    const result = await forgetPasswordHandler(
      { email: "user@example.com" },
      logger,
    );

    expect(result.isSuccess).toBe(true);
    if (result.isSuccess) {
      expect(result.data?.success).toBe(true);
    }
  });
});
