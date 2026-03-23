## 2025-01-16 - TS-Node vs ESM Compatibility
**Learning:** `ts-node` 10.x has known compatibility issues with newer TypeScript versions and ESM environments, causing `TypeError: state.conditions.includes is not a function`. This environment uses Node 22 and TypeScript 5.9.
**Action:** For verification, rely on compiling to JS or small standalone scripts when the test runner is broken. Do not try to fix the entire test runner infrastructure if not asked.

## $(date +%Y-%m-%d) - Optimize Map-based aggregation in Drizzle ORM lookups
**Learning:** In Map-based aggregations constructed from database joins (like merging roles with their permissions), repeating `map.has(id)` and `map.get(id)` creates unnecessary overhead. Using a single `let entry = map.get(id); if (!entry) { ... }` reduces operations by half and showed ~20% performance improvement (681ms down to 546ms for 10k runs).
**Action:** When aggregating database results into a Map/Dictionary in TypeScript, always use the single-lookup pattern (`get` + undefined check) instead of the two-step (`has` + `get`) pattern.
