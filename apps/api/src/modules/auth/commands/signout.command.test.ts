import { describe, it, expect, vi, beforeEach } from "vitest";

const getSession = vi.hoisted(() => vi.fn());
const signOut = vi.hoisted(() => vi.fn());

vi.mock("@repo/auth", () => ({
  auth: {
    api: {
      getSession,
      signOut,
    },
  },
}));

import { signOutHandler } from "./signout.command";

describe("signOutHandler", () => {
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

    const result = await signOutHandler(new Headers(), logger);

    expect(result.isSuccess).toBe(false);
    if (!result.isSuccess) {
      expect(result.errors?.[0]?.code).toBe("UNAUTHORIZED");
    }
  });

  it("should sign out, when session is present", async () => {
    getSession.mockResolvedValue({ user: { id: "user-1" } });

    const response = {
      headers: new Headers({ "set-cookie": "" }),
    };
    signOut.mockResolvedValue(response);

    const result = await signOutHandler(new Headers(), logger);

    expect(result.isSuccess).toBe(true);
    expect(result.responseHeaders).toBe(response.headers);
  });
});
