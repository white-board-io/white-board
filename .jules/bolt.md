## 2025-01-16 - Drizzle Returning Clause
**Learning:** To optimize performance in `apps/api` during mutation operations (like delete, update, or toggle), use Drizzle ORM's `.returning()` clause to atomically modify a record and retrieve its data in a single query, eliminating redundant `findById` existence checks.
**Action:** Replace two-step database mutations with single atomic queries using `.returning()`.

## 2024-07-12 - Database Level Soft-Delete Filtering
**Learning:** For database queries using Drizzle ORM, prioritize filtering records at the database level (e.g., using `.where(and(...))` to exclude soft-deleted items) rather than fetching all records and applying application-level filtering (like `Array.prototype.filter()`). This avoids unnecessary database I/O, network transfer, and memory allocation.
**Action:** Always check if application-level array filtering can be pushed down to the database query level using SQL `WHERE` clauses.
