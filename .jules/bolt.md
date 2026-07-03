## 2025-01-16 - TS-Node vs ESM Compatibility
**Learning:** `ts-node` 10.x has known compatibility issues with newer TypeScript versions and ESM environments, causing `TypeError: state.conditions.includes is not a function`. This environment uses Node 22 and TypeScript 5.9.
**Action:** For verification, rely on compiling to JS or small standalone scripts when the test runner is broken. Do not try to fix the entire test runner infrastructure if not asked.

## 2025-01-20 - Atomic Mutations in Drizzle ORM
**Learning:** In Drizzle ORM, you can use `.returning()` clauses and atomic operators like `not(table.column)` to perform conditional updates or deletes without needing an initial `findById` existence check. This cuts database queries in half and eliminates race conditions.
**Action:** When implementing mutations, prioritize returning clauses. If an initial query is only used for existence checks before updating/deleting, remove it and check if the mutation itself returned a result.
