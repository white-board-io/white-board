import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@utils": resolve(__dirname, "src/utils"),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    exclude: ["test/**"],
    coverage: {
      provider: "v8",
    },
  },
});
