## 2025-01-16 - TS-Node vs ESM Compatibility
**Learning:** `ts-node` 10.x has known compatibility issues with newer TypeScript versions and ESM environments, causing `TypeError: state.conditions.includes is not a function`. This environment uses Node 22 and TypeScript 5.9.
**Action:** For verification, rely on compiling to JS or small standalone scripts when the test runner is broken. Do not try to fix the entire test runner infrastructure if not asked.

## 2025-01-16 - Atomic DB Mutations
**Learning:** Using Drizzle's `.returning()` in mutations (update, delete, toggle) combined with checking the return value eliminates the need for prior `findById` existence checks. This prevents race conditions and cuts database query roundtrips in half for these operations.
**Action:** When refactoring command handlers, always look for existence checks immediately preceding a mutation, and consolidate them into a single `.returning()` atomic query.
