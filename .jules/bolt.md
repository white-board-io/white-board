## 2025-01-16 - TS-Node vs ESM Compatibility
**Learning:** `ts-node` 10.x has known compatibility issues with newer TypeScript versions and ESM environments, causing `TypeError: state.conditions.includes is not a function`. This environment uses Node 22 and TypeScript 5.9.
**Action:** For verification, rely on compiling to JS or small standalone scripts when the test runner is broken. Do not try to fix the entire test runner infrastructure if not asked.

## 2025-01-16 - Optimize Hash Map lookups
**Learning:** In Map-based data aggregations (common when parsing left-joined database rows), the pattern `if (!map.has(key)) { map.set(key, val); } map.get(key).push(data);` is inefficient because it performs up to 3 hash lookups per row.
**Action:** Replace this pattern by using `let entry = map.get(key);` and caching the entry reference. If undefined, create, `set`, and assign the entry. This reduces the number of lookups and performs noticeably faster (~20-40%) on large arrays.
