## 2025-01-16 - TS-Node vs ESM Compatibility
**Learning:** `ts-node` 10.x has known compatibility issues with newer TypeScript versions and ESM environments, causing `TypeError: state.conditions.includes is not a function`. This environment uses Node 22 and TypeScript 5.9.
**Action:** For verification, rely on compiling to JS or small standalone scripts when the test runner is broken. Do not try to fix the entire test runner infrastructure if not asked.

## 2025-01-20 - Map caching & Array traversal
**Learning:** For Map-based aggregations (e.g., aggregating database joins), replacing the `map.has(key)` + `map.get(key)` pattern with a single `let entry = map.get(key)` lookup and an undefined check avoids redundant search operations, significantly improving performance (20-40%) on large datasets. Also, replacing chained `.filter().map()` operations on arrays with a single `for...of` loop reduces traversals and array allocations.
**Action:** Always check loop bodies for `.has()` followed by `.get()` on the same map, and optimize by caching the result of a single `.get()`. Combine array transformations into single loops.
