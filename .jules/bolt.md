## 2025-01-16 - TS-Node vs ESM Compatibility
**Learning:** `ts-node` 10.x has known compatibility issues with newer TypeScript versions and ESM environments, causing `TypeError: state.conditions.includes is not a function`. This environment uses Node 22 and TypeScript 5.9.
**Action:** For verification, rely on compiling to JS or small standalone scripts when the test runner is broken. Do not try to fix the entire test runner infrastructure if not asked.

## 2025-01-16 - Atomic Drizzle Mutations and Error Handling Regressions
**Learning:** Replacing a two-step `SELECT` then `UPDATE` with a single, atomic `UPDATE ... RETURNING` query in Drizzle ORM cuts DB round-trips in half and prevents race conditions. However, removing the initial `findById` existence check can inadvertently remove the associated `RESOURCE_NOT_FOUND` error handling, causing the application to return an internal error if the updated record is not found.
**Action:** When refactoring command handlers to use atomic Drizzle mutations, explicitly check if the returned result is `undefined` (indicating the record wasn't found) and handle it by returning the correct `RESOURCE_NOT_FOUND` error to maintain the API contract.
