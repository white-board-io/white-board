## 2024-05-18 - Atomic Drizzle ORM mutations
**Learning:** Checking for existence (`findById`) prior to a mutation operation (`update`, `delete`) creates a race condition and duplicates database queries.
**Action:** Use Drizzle ORM's `.returning()` feature to atomically perform the mutation and check for existence in a single query. Update handlers to check if the result of the mutation is undefined/falsy to maintain 'Not Found' semantics.
