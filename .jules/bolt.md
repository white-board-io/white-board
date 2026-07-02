## 2025-01-16 - TS-Node vs ESM Compatibility
**Learning:** `ts-node` 10.x has known compatibility issues with newer TypeScript versions and ESM environments, causing `TypeError: state.conditions.includes is not a function`. This environment uses Node 22 and TypeScript 5.9.
**Action:** For verification, rely on compiling to JS or small standalone scripts when the test runner is broken. Do not try to fix the entire test runner infrastructure if not asked.

## 2024-07-02 - Drizzle ORM Atomic Mutations & not() Pattern
**Learning:** For mutation operations like delete, update, or toggle, retrieving a record beforehand with an existence check query (e.g. `findById`) introduces unnecessary database overhead. Drizzle ORM supports a `.returning()` clause that enables atomic updates/deletes in a single query while returning the modified data. Additionally, boolean toggles can be efficiently managed using Drizzle's `not()` operator within a `.set()` clause.
**Action:** When performing mutations, eliminate redundant `findById` existence checks by configuring Drizzle to atomically update and return the record (returning `undefined` if no records were affected). Export and utilize the `not` operator from `@repo/database` for database-level boolean flips, effectively halving the number of queries and mitigating race conditions.
