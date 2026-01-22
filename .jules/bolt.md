## 2025-01-16 - TS-Node vs ESM Compatibility
**Learning:** `ts-node` 10.x has known compatibility issues with newer TypeScript versions and ESM environments, causing `TypeError: state.conditions.includes is not a function`. This environment uses Node 22 and TypeScript 5.9.
**Action:** For verification, rely on compiling to JS or small standalone scripts when the test runner is broken. Do not try to fix the entire test runner infrastructure if not asked.

## 2025-01-16 - Missing Database Indexes
**Learning:** The `todos` table lacks indexes on `completed`, `priority`, and `created_at` columns, despite being frequently used for filtering and sorting in `getAllTodosHandler`. This leads to full table scans (O(n)) instead of index scans (O(log n)).
**Action:** Always verify schema definitions against query patterns. Adding indexes to these columns will significantly improve read performance as the dataset grows.
