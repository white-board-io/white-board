## 2025-01-16 - TS-Node vs ESM Compatibility
**Learning:** `ts-node` 10.x has known compatibility issues with newer TypeScript versions and ESM environments, causing `TypeError: state.conditions.includes is not a function`. This environment uses Node 22 and TypeScript 5.9.
**Action:** For verification, rely on compiling to JS or small standalone scripts when the test runner is broken. Do not try to fix the entire test runner infrastructure if not asked.

## 2025-02-14 - Drizzle Query Builder Overwriting Behavior
**Learning:** In Drizzle ORM query builders, calling `.where()` multiple times on the same query object overwrites previous conditions instead of appending them.
**Action:** Always accumulate conditions in an array and use `and(...conditions)` inside a single `.where()` call for dynamic filtering.
