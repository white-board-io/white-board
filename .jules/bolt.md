## 2025-01-16 - TS-Node vs ESM Compatibility
**Learning:** `ts-node` 10.x has known compatibility issues with newer TypeScript versions and ESM environments, causing `TypeError: state.conditions.includes is not a function`. This environment uses Node 22 and TypeScript 5.9.
**Action:** For verification, rely on compiling to JS or small standalone scripts when the test runner is broken. Do not try to fix the entire test runner infrastructure if not asked.

## 2025-01-20 - Map Lookups and Array Aggregations
**Learning:** Optimizing Map-based data aggregation from database joins (e.g., calling `map.has(key)` followed by `map.get(key)`) with a single `let entry = map.get(key);` lookup and checking for `undefined` yields significant performance gains (~20-40%) on large result sets. Also, replacing a `filter().map()` chain with a single `for...of` loop yields significant performance gains (~30-40%) on large arrays (10k+ items) by reducing traversals and intermediate array allocations.
**Action:** When aggregating results (especially from database joins), use a single Map `.get()` lookup and cache the reference instead of `.has()` followed by `.get()`. Prefer a single loop over `filter().map()` chains for large arrays.
