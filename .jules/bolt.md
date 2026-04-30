## 2025-01-16 - TS-Node vs ESM Compatibility
**Learning:** `ts-node` 10.x has known compatibility issues with newer TypeScript versions and ESM environments, causing `TypeError: state.conditions.includes is not a function`. This environment uses Node 22 and TypeScript 5.9.
**Action:** For verification, rely on compiling to JS or small standalone scripts when the test runner is broken. Do not try to fix the entire test runner infrastructure if not asked.

## 2024-05-01 - Drizzle ORM Mutations with .returning()
**Learning:** Redundant `findById` checks before mutations (like update or delete) add unnecessary O(1) database query overhead per operation.
**Action:** Use Drizzle ORM's `.returning()` clause to atomically modify a record and retrieve its data in a single query, checking if the returned result is undefined to determine existence instead.
