## 2025-01-16 - TS-Node vs ESM Compatibility
**Learning:** `ts-node` 10.x has known compatibility issues with newer TypeScript versions and ESM environments, causing `TypeError: state.conditions.includes is not a function`. This environment uses Node 22 and TypeScript 5.9.
**Action:** For verification, rely on compiling to JS or small standalone scripts when the test runner is broken. Do not try to fix the entire test runner infrastructure if not asked.

## 2025-05-18 - Drizzle ORM `.where()` Overwrite
**Learning:** Drizzle ORM query builder `.where()` calls overwrite the previous `WHERE` clause instead of appending with `AND`. Multiple filters must be combined using `and(...)` inside a single `.where()` call.
**Action:** Always check for multiple `where()` calls on the same query builder and refactor to use `and()` for combining conditions.
