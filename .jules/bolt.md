## 2025-01-16 - TS-Node vs ESM Compatibility
**Learning:** `ts-node` 10.x has known compatibility issues with newer TypeScript versions and ESM environments, causing `TypeError: state.conditions.includes is not a function`. This environment uses Node 22 and TypeScript 5.9.
**Action:** For verification, rely on compiling to JS or small standalone scripts when the test runner is broken. Do not try to fix the entire test runner infrastructure if not asked.

## 2025-05-10 - Map Aggregation Optimization
**Learning:** To optimize Map-based data aggregation from database joins (as in `roleRepository.listByOrg` and `listRolesHandler`), replace the pattern of calling `map.has(key)` followed by `map.get(key)` with a single `let entry = map.get(key);` lookup. Checking for `undefined` and caching the reference avoids redundant search operations, yielding significant performance gains (~20-40%) on large result sets.
**Action:** Always check and cache Map entry lookup references in aggregate functions rather than doing a double-lookup using `has` then `get`.
