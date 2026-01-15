import { config as baseConfig } from "@repo/eslint-config/react-internal";

/** @type {import("eslint").Linter.Config[]} */
const config = [
  ...baseConfig,
  {
    rules: {
      "react/prop-types": "off",
    },
  },
];

export default config;
