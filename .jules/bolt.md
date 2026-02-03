## 2025-01-16 - TS-Node vs ESM Compatibility
**Learning:** `ts-node` 10.x has known compatibility issues with newer TypeScript versions and ESM environments, causing `TypeError: state.conditions.includes is not a function`. This environment uses Node 22 and TypeScript 5.9.
**Action:** For verification, rely on compiling to JS or small standalone scripts when the test runner is broken. Do not try to fix the entire test runner infrastructure if not asked.

## 2025-01-28 - Drizzle ORM Query Builder Overwrite
**Learning:** In Drizzle ORM, consecutive calls to `.where()` on a query builder instance (e.g., `query.where(A); query.where(B);`) overwrite the previous WHERE clause rather than appending to it. This leads to incorrect filtering (only the last condition applies).
**Action:** Always collect conditions into an array and use `and(...conditions)` inside a single `.where()` call when dynamically building queries with multiple optional filters.
