import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import turboPlugin from "eslint-plugin-turbo";
import tseslint from "typescript-eslint";
import onlyWarn from "eslint-plugin-only-warn";
import globals from "globals";

/**
 * A custom ESLint configuration for Node.js backend applications (e.g., Fastify, Express).
 * Uses strict TypeScript rules for enhanced type safety.
 *
 * @type {import("eslint").Linter.Config[]}
 */
export const config = [
  js.configs.recommended,
  eslintConfigPrettier,
  // Use strict TypeScript rules for enhanced type safety
  ...tseslint.configs.strict,
  // Node.js globals
  {
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  // Turbo plugin
  {
    plugins: {
      turbo: turboPlugin,
    },
    rules: {
      "turbo/no-undeclared-env-vars": "warn",
    },
  },
  // Only warn plugin (convert errors to warnings in development)
  {
    plugins: {
      onlyWarn,
    },
  },
  // Ignore patterns
  {
    ignores: ["dist/**", "node_modules/**"],
  },
];
