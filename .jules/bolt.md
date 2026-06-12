## 2025-01-16 - TS-Node vs ESM Compatibility
**Learning:** `ts-node` 10.x has known compatibility issues with newer TypeScript versions and ESM environments, causing `TypeError: state.conditions.includes is not a function`. This environment uses Node 22 and TypeScript 5.9.
**Action:** For verification, rely on compiling to JS or small standalone scripts when the test runner is broken. Do not try to fix the entire test runner infrastructure if not asked.
## 2025-01-20 - Avoiding DB Roundtrips with Drizzle ORM
**Learning:** Using Drizzle ORM's `.returning()` allows you to retrieve the updated/deleted record in the same query. For conditional existence checks before updates/deletes, this often removes the need for an initial `findById` query. Additionally, you can execute atomic boolean toggles using raw SQL directly in `.set()`, such as `completed: sql\`NOT ${table.column}\``.
**Action:** When optimizing performance for Drizzle ORM updates or deletes, eliminate unnecessary existence checks and rely on `.returning()`. For boolean toggles, prefer atomic raw SQL `.set()` updates.
