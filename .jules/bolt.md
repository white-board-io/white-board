## 2025-01-16 - TS-Node vs ESM Compatibility
**Learning:** `ts-node` 10.x has known compatibility issues with newer TypeScript versions and ESM environments, causing `TypeError: state.conditions.includes is not a function`. This environment uses Node 22 and TypeScript 5.9.
**Action:** For verification, rely on compiling to JS or small standalone scripts when the test runner is broken. Do not try to fix the entire test runner infrastructure if not asked.
## 2024-05-12 - Map Aggregation Optimization
**Learning:** Replacing a Map `.has()` check followed by a `.get()` lookup with a single `.get()` call and caching the result avoids redundant search operations, yielding significant performance gains (~20-40%) on large result sets.
**Action:** When aggregating database joins using Maps, always prefer a single `let entry = map.get(key);` lookup and check for `undefined`.
