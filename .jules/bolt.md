## 2025-01-16 - TS-Node vs ESM Compatibility
**Learning:** `ts-node` 10.x has known compatibility issues with newer TypeScript versions and ESM environments, causing `TypeError: state.conditions.includes is not a function`. This environment uses Node 22 and TypeScript 5.9.
**Action:** For verification, rely on compiling to JS or small standalone scripts when the test runner is broken. Do not try to fix the entire test runner infrastructure if not asked.
## 2025-02-12 - Atomic Mutations with Drizzle
**Learning:** To optimize performance in `apps/api` during mutation operations (like delete, update, and toggle), redundant `findById` existence checks can be eliminated by relying on Drizzle ORM's `.returning()` clause. This allows atomic modification of a record and retrieving its data in a single database query. For atomic boolean toggles, `sql\`NOT ${table.column}\`` should be used in the `.set()` clause.
**Action:** Use `.returning()` to fetch the updated/deleted entity instead of performing a separate `.findById` check before mutating.
