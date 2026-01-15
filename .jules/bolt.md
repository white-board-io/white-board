## 2025-02-18 - Drizzle Schema Indexing
**Learning:** Drizzle schemas do not automatically index columns used in default sort orders (e.g., `createdAt`). Explicit `index()` definitions are required in the table config callback.
**Action:** Always audit `repository` queries for `orderBy` clauses and ensure corresponding indexes exist in the Drizzle schema.
