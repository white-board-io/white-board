## 2025-01-16 - TS-Node vs ESM Compatibility
**Learning:** `ts-node` 10.x has known compatibility issues with newer TypeScript versions and ESM environments, causing `TypeError: state.conditions.includes is not a function`. This environment uses Node 22 and TypeScript 5.9.
**Action:** For verification, rely on compiling to JS or small standalone scripts when the test runner is broken. Do not try to fix the entire test runner infrastructure if not asked.

## 2025-01-16 - Type Error with Build TS
**Learning:** `apps/api` `tsconfig.json` includes test files which causes `bun run build:ts` (or `npm run build:ts`) to fail on type errors within test files. This was mentioned in memory context.
**Action:** Ignore `build:ts` test file failures if not making changes in those tests. The memory explicitly says: "The `apps/api` `tsconfig.json` includes all files in `src` (`src/**/*.ts`) and does not exclude test files; this causes `bun run build:ts` to fail if test files contain type errors."
