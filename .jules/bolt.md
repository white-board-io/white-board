## 2025-01-16 - TS-Node vs ESM Compatibility
**Learning:** `ts-node` 10.x has known compatibility issues with newer TypeScript versions and ESM environments, causing `TypeError: state.conditions.includes is not a function`. This environment uses Node 22 and TypeScript 5.9.
**Action:** For verification, rely on compiling to JS or small standalone scripts when the test runner is broken. Do not try to fix the entire test runner infrastructure if not asked.

## 2025-01-20 - Atomic Mutations and Query Reduction
**Learning:** In `apps/api`, replacing `findById` existence checks with Drizzle's `.returning()` clause on mutations (`delete`, `update`) halves the number of queries. For toggling booleans, combining `.update().set({ completed: not(...) }).returning()` prevents race conditions while reducing query overhead. Fallback lookups must be preserved in validation flows to prevent error-precedence regressions (e.g. failing validation instead of throwing 404).
**Action:** Always prefer atomic `.returning()` operations over find-then-update logic when possible. Handle `undefined` properly to maintain 404s, and implement fallback existence checks when dependent validations precede the main mutation.
