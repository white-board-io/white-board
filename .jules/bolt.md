## 2025-01-16 - TS-Node vs ESM Compatibility
**Learning:** `ts-node` 10.x has known compatibility issues with newer TypeScript versions and ESM environments, causing `TypeError: state.conditions.includes is not a function`. This environment uses Node 22 and TypeScript 5.9.
**Action:** For verification, rely on compiling to JS or small standalone scripts when the test runner is broken. Do not try to fix the entire test runner infrastructure if not asked.

## 2025-02-15 - Atomic deletes with returning()
**Learning:** Using Drizzle ORM's `.returning()` clause on deletes atomically modifies the record and returns its data in a single query, which cuts database queries in half by eliminating redundant `findById` existence checks.
**Action:** When implementing mutation operations (like delete, update, or toggle) in API command handlers, replace `findById` existence checks with atomic Drizzle mutations returning the data, and handle `undefined` results properly to maintain `RESOURCE_NOT_FOUND` behavior.
