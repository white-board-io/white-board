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
}));
const eq = vi.hoisted(() => vi.fn());
const and = vi.hoisted(() => vi.fn());

vi.mock("@repo/database", () => ({ db, eq, and }));

vi.mock("@repo/database/schema/auth", () => ({
  account: {},
}));

import { changePasswordHandler } from "./change-password.command";

describe("changePasswordHandler", () => {
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
    const result = await changePasswordHandler(
      { currentPassword: "old", newPassword: "password123" },
      {} as never,
      logger,
    );

    expect(result.isSuccess).toBe(false);
    expect(result.errors?.[0]?.code).toBe("UNAUTHORIZED");
  });

  it("should change password, when current password is valid", async () => {
    db.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([
            { id: "acc-1", password: "salt:68617368" },
          ]),
        }),
      }),
    });

    db.update.mockReturnValue({
      set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }),
    });

    const result = await changePasswordHandler(
      { currentPassword: "old", newPassword: "password123" },
      { user: { id: "user-1" } } as never,
      logger,
    );

    expect(result.isSuccess).toBe(true);
    expect(result.data?.success).toBe(true);
  });
});
