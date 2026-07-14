## 2025-01-16 - TS-Node vs ESM Compatibility
**Learning:** `ts-node` 10.x has known compatibility issues with newer TypeScript versions and ESM environments, causing `TypeError: state.conditions.includes is not a function`. This environment uses Node 22 and TypeScript 5.9.
**Action:** For verification, rely on compiling to JS or small standalone scripts when the test runner is broken. Do not try to fix the entire test runner infrastructure if not asked.

## 2025-01-20 - Atomic Mutations to Eliminate Existence Checks
**Learning:** Performance in Fastify/Drizzle applications can be significantly improved by removing redundant `findById` existence queries before mutation operations (`update`, `delete`, `toggle`). Drizzle's `.returning()` clause allows executing the mutation and checking existence simultaneously. However, care must be taken with dependent validation logic (e.g. uniqueness checks) that might erroneously return validation errors instead of 'Not Found' if the record doesn't exist.
**Action:** When refactoring command handlers, defer the `findById` check to a fallback case (only executed if validation fails) to correctly disambiguate validation errors from non-existent records. Always configure mocks in unit tests to simulate the atomic mutation returning `undefined`.
