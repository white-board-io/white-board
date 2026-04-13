## 2025-01-16 - TS-Node vs ESM Compatibility
**Learning:** `ts-node` 10.x has known compatibility issues with newer TypeScript versions and ESM environments, causing `TypeError: state.conditions.includes is not a function`. This environment uses Node 22 and TypeScript 5.9.
**Action:** For verification, rely on compiling to JS or small standalone scripts when the test runner is broken. Do not try to fix the entire test runner infrastructure if not asked.

## 2026-04-13 - Avoid `findById` before mutations
**Learning:** In Drizzle ORM, using `.returning()` during mutation operations (`update`, `delete`) allows you to atomically perform the operation and check for record existence in a single query. This avoids the O(N) or even O(log N) overhead of a separate `findById` query and reduces database round trips. For atomic toggles, use raw SQL inside `.set()`, e.g., `completed: sql\`NOT ${table.column}\``.
**Action:** Default to using `.returning()` for update/delete operations instead of fetching the record first to verify it exists, especially when the only reason for fetching is existence checking.
