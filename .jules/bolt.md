## 2025-01-16 - TS-Node vs ESM Compatibility
**Learning:** `ts-node` 10.x has known compatibility issues with newer TypeScript versions and ESM environments, causing `TypeError: state.conditions.includes is not a function`. This environment uses Node 22 and TypeScript 5.9.
**Action:** For verification, rely on compiling to JS or small standalone scripts when the test runner is broken. Do not try to fix the entire test runner infrastructure if not asked.
## 2025-01-16 - Map Lookup Optimization
**Learning:** `map.has(key)` followed by `map.get(key)` is a performance anti-pattern. Doing a single `const entry = map.get(key);` and checking for `undefined` saves redundant search operations and yields significant performance gains.
**Action:** Replace `has` -> `set` and `get` patterns with a direct `get` then cache logic.
