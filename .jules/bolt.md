## 2025-01-16 - TS-Node vs ESM Compatibility
**Learning:** `ts-node` 10.x has known compatibility issues with newer TypeScript versions and ESM environments, causing `TypeError: state.conditions.includes is not a function`. This environment uses Node 22 and TypeScript 5.9.
**Action:** For verification, rely on compiling to JS or small standalone scripts when the test runner is broken. Do not try to fix the entire test runner infrastructure if not asked.

## 2025-01-16 - Map Aggregation Performance Optimization
**Learning:** Performing multiple Map lookups (`map.has(key)` followed by `map.get(key)`) within large loops (like database record aggregation) introduces significant redundant search overhead (O(1) twice, multiplying constants).
**Action:** Replace `has` + `get` patterns with a single `let entry = map.get(key)` lookup. If `entry` is undefined, initialize and `map.set(key, entry)`. Cache the `entry` reference to directly modify it (e.g., pushing to arrays) without further Map retrievals. This yields considerable performance gains on large data sets.
