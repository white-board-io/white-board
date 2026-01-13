import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import turboPlugin from "eslint-plugin-turbo";
import tseslint from "typescript-eslint";
import onlyWarn from "eslint-plugin-only-warn";
import pluginReactHooks from "eslint-plugin-react-hooks";
import pluginReact from "eslint-plugin-react";
import pluginRouter from "@tanstack/eslint-plugin-router";
import globals from "globals";

/**
 * A custom ESLint configuration for TanStack Start applications.
 * Uses strict TypeScript rules for enhanced type safety.
 *
 * @type {import("eslint").Linter.Config[]}
 */
export const config = [
  js.configs.recommended,
  eslintConfigPrettier,
  // Use strict TypeScript rules for enhanced type safety
  ...tseslint.configs.strict,
  // TanStack Router plugin recommended rules
  ...pluginRouter.configs["flat/recommended"],
  // React recommended settings
  {
    ...pluginReact.configs.flat.recommended,
    languageOptions: {
      ...pluginReact.configs.flat.recommended.languageOptions,
      globals: {
        ...globals.serviceworker,
        ...globals.browser,
      },
    },
  },
  // JSX runtime - no need to import React
  pluginReact.configs.flat["jsx-runtime"],
  // React Hooks
  {
    plugins: {
      "react-hooks": pluginReactHooks,
    },
    settings: { react: { version: "detect" } },
    rules: {
      ...pluginReactHooks.configs.recommended.rules,
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
    ignores: ["dist/**", ".tanstack/**", ".vinxi/**", ".output/**"],
  },
];
