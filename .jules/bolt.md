## 2025-01-16 - TS-Node vs ESM Compatibility
**Learning:** `ts-node` 10.x has known compatibility issues with newer TypeScript versions and ESM environments, causing `TypeError: state.conditions.includes is not a function`. This environment uses Node 22 and TypeScript 5.9.
**Action:** For verification, rely on compiling to JS or small standalone scripts when the test runner is broken. Do not try to fix the entire test runner infrastructure if not asked.

## 2026-04-20 - Optimize Map lookups in Join Data Aggregation
**Learning:** In Map-based aggregations constructed from database JOIN queries, checking `map.has(key)` and then calling `map.get(key)` executes redundant search operations on the Map data structure.
**Action:** Use a single `let entry = map.get(key);` lookup. Check for falsy values and assign/set if missing to drastically improve performance on large result sets.
