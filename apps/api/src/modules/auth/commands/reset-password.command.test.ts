import { describe, it, expect, vi, beforeEach } from "vitest";

const cryptoMock = vi.hoisted(() => ({
  randomBytes: vi.fn(() => Buffer.from("salt")),
  pbkdf2: vi.fn((
    _password: string,
    _salt: string,
    _iterations: number,
    _keylen: number,
    _digest: string,
    cb: (err: Error | null, derivedKey: Buffer) => void,
  ) => cb(null, Buffer.from("hash"))),
}));

vi.mock("crypto", () => ({
  default: cryptoMock,
  randomBytes: cryptoMock.randomBytes,
  pbkdf2: cryptoMock.pbkdf2,
}));

const db = vi.hoisted(() => ({
  select: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
}));
const eq = vi.hoisted(() => vi.fn());
const and = vi.hoisted(() => vi.fn());

vi.mock("@repo/database", () => ({ db, eq, and }));

vi.mock("@repo/database/schema/auth", () => ({
  user: {},
  account: {},
  verification: {},
}));

import { resetPasswordHandler } from "./reset-password.command";

describe("resetPasswordHandler", () => {
  const logger = {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return forbidden, when token is invalid", async () => {
    db.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([]),
        }),
      }),
    });

    const result = await resetPasswordHandler(
      { token: "bad", newPassword: "password123" },
      logger,
    );

    expect(result.isSuccess).toBe(false);
    expect(result.errors?.[0]?.code).toBe("FORBIDDEN");
  });

  it("should return validation errors, when input is invalid", async () => {
    const result = await resetPasswordHandler(
      { token: "", newPassword: "short" },
      logger,
    );

    expect(result.isSuccess).toBe(false);
    expect(result.errors?.length).toBeGreaterThan(0);
  });

  it("should reset password, when token is valid", async () => {
    const verificationRecord = {
      id: "ver-1",
      value: "token-1",
      identifier: "password-reset:user@example.com",
      expiresAt: new Date(Date.now() + 1000 * 60 * 60),
    };

    db.select
      .mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([verificationRecord]),
          }),
        }),
      })
      .mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ id: "user-1" }]),
          }),
        }),
      });

    db.update.mockReturnValue({
      set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }),
    });

    db.delete.mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) });

    const result = await resetPasswordHandler(
      { token: "token-1", newPassword: "password123" },
      logger,
    );

    expect(result.isSuccess).toBe(true);
    expect(result.data?.success).toBe(true);
  });
});
