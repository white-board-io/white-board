## 2025-01-16 - TS-Node vs ESM Compatibility
**Learning:** `ts-node` 10.x has known compatibility issues with newer TypeScript versions and ESM environments, causing `TypeError: state.conditions.includes is not a function`. This environment uses Node 22 and TypeScript 5.9.
**Action:** For verification, rely on compiling to JS or small standalone scripts when the test runner is broken. Do not try to fix the entire test runner infrastructure if not asked.

## 2025-02-18 - Drizzle ORM Query Builder Behavior
**Learning:** Chaining `.where()` calls on a Drizzle query builder instance overwrites the previous condition instead of combining them with AND. This can lead to silently ignoring filters and over-fetching data.
**Action:** Always collect multiple conditions in an array and apply them using a single `.where(and(...conditions))` call.
