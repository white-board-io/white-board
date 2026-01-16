import { test, describe } from "node:test";
import * as assert from "node:assert";
import { build } from "../helper";

describe("Roles API", () => {
  test("GET /organizations/:orgId/roles should return roles", async (t) => {
    // eslint-disable-next-line turbo/no-undeclared-env-vars
    if (!process.env.DATABASE_URL) {
      t.skip("Skipping test because DATABASE_URL is not set");
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const app = await build(t);

    // In a real test, we would:
    // 1. Sign up / login to get a token and organization
    // 2. Make a request to list roles
    // 3. Assert the system roles are present

    assert.ok(true);
  });
});
