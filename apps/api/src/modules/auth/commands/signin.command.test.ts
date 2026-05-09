import { describe, it, expect, vi, beforeEach } from "vitest";

const signInEmail = vi.hoisted(() => vi.fn());

vi.mock("@repo/auth", () => ({
  auth: {
    api: {
      signInEmail,
    },
  },
}));

import { signInHandler } from "./signin.command";

describe("signInHandler", () => {
  const logger = {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return validation errors, when input is invalid", async () => {
    const result = await signInHandler({}, new Headers(), logger);

    expect(result.isSuccess).toBe(false);
    if (!result.isSuccess) {
      expect(result.errors?.length).toBeGreaterThan(0);
    }
  });

  it("should return validation errors, when email is invalid", async () => {
    const result = await signInHandler(
      { email: "bad", password: "x" },
      new Headers(),
      logger,
    );

    expect(result.isSuccess).toBe(false);
    if (!result.isSuccess) {
      expect(result.errors?.length).toBeGreaterThan(0);
    }
  });

  it("should return user data, when credentials are valid", async () => {
    const response = {
      headers: new Headers({ "set-cookie": "session=abc" }),
      json: vi.fn().mockResolvedValue({
        user: {
          id: "user-1",
          email: "user@example.com",
          firstName: "Test",
          lastName: "User",
        },
      }),
    };

    signInEmail.mockResolvedValue(response);

    const result = await signInHandler(
      { email: "user@example.com", password: "password" },
      new Headers(),
      logger,
    );

    expect(result.isSuccess).toBe(true);
    if (result.isSuccess) {
      expect(result.data?.user.email).toBe("user@example.com");
      expect(result.responseHeaders).toBe(response.headers);
    }
  });
});
