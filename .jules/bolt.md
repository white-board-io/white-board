## 2025-01-16 - TS-Node vs ESM Compatibility
**Learning:** `ts-node` 10.x has known compatibility issues with newer TypeScript versions and ESM environments, causing `TypeError: state.conditions.includes is not a function`. This environment uses Node 22 and TypeScript 5.9.
**Action:** For verification, rely on compiling to JS or small standalone scripts when the test runner is broken. Do not try to fix the entire test runner infrastructure if not asked.
## 2024-05-18 - Atomic Drizzle ORM mutations
**Learning:** In `apps/api` during mutation operations (like delete, update, or toggle), Drizzle ORM's `.returning()` clause can be used to atomically modify a record and retrieve its data in a single query. Using `not()` in the `.set()` clause allows for atomic boolean toggles. This eliminates redundant `findById` existence checks, cutting database queries in half and improving safety against concurrent request conflicts.
**Action:** Use `.returning()` on `update`/`delete` operations and capture the result to perform not-found checks instead of running a preliminary `findById` query. Use `not()` for toggles.
