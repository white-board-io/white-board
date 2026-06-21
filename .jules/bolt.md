## 2025-01-16 - TS-Node vs ESM Compatibility
**Learning:** `ts-node` 10.x has known compatibility issues with newer TypeScript versions and ESM environments, causing `TypeError: state.conditions.includes is not a function`. This environment uses Node 22 and TypeScript 5.9.
**Action:** For verification, rely on compiling to JS or small standalone scripts when the test runner is broken. Do not try to fix the entire test runner infrastructure if not asked.

## 2025-06-21 - Drizzle Atomicity for existence checks
**Learning:** In Drizzle ORM mutations (`delete`, `update`), chaining `.returning()` can replace manual "Read-before-Write" `findById` queries by validating existence natively within the database layer. Additionally, raw SQL updates like `completed: sql\`NOT \${table.column}\`` can process boolean toggles efficiently without needing the current record's state, cutting query amounts entirely in half and preventing concurrency race conditions on those mutations.
**Action:** Default to `update().returning()` or `delete().returning()` patterns for mutations when writing Drizzle APIs instead of manual `findById` wrappers.
