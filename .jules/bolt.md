## 2025-01-16 - TS-Node vs ESM Compatibility
**Learning:** `ts-node` 10.x has known compatibility issues with newer TypeScript versions and ESM environments, causing `TypeError: state.conditions.includes is not a function`. This environment uses Node 22 and TypeScript 5.9.
**Action:** For verification, rely on compiling to JS or small standalone scripts when the test runner is broken. Do not try to fix the entire test runner infrastructure if not asked.

## 2026-06-29 - Redundant Map Lookups in Aggregation Loops
**Learning:** The codebase contains multiple instances of a common anti-pattern during data aggregation from database joins: using `map.has(key)` followed by `map.get(key)`. This results in two map traversal operations for every row.
**Action:** Optimize by performing a single `let entry = map.get(key);` lookup, checking for undefined, and using the cached reference. This yields significant performance gains on large datasets.
