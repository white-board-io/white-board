## 2025-01-16 - TS-Node vs ESM Compatibility
**Learning:** `ts-node` 10.x has known compatibility issues with newer TypeScript versions and ESM environments, causing `TypeError: state.conditions.includes is not a function`. This environment uses Node 22 and TypeScript 5.9.
**Action:** For verification, rely on compiling to JS or small standalone scripts when the test runner is broken. Do not try to fix the entire test runner infrastructure if not asked.

## 2026-04-23 - Map Aggregation Optimization
**Learning:** Calling map.has(key) followed by map.get(key) during large result set aggregation causes redundant O(1) lookups. Replacing it with a single let entry = map.get(key) lookup caches the reference and avoids the extra lookup.
**Action:** Use a single let entry = map.get(key); check for undefined and cache the reference when aggregating database join results.
