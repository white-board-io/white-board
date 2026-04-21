## 2025-01-16 - TS-Node vs ESM Compatibility
**Learning:** `ts-node` 10.x has known compatibility issues with newer TypeScript versions and ESM environments, causing `TypeError: state.conditions.includes is not a function`. This environment uses Node 22 and TypeScript 5.9.
**Action:** For verification, rely on compiling to JS or small standalone scripts when the test runner is broken. Do not try to fix the entire test runner infrastructure if not asked.

## 2026-04-21 - Replace filter().map() with for...of loops
**Learning:** Replacing `.filter().map()` chains with a single `for...of` loop avoids intermediate array allocations and reduces traversals. This yields significant performance gains (~30-40%) on large arrays (e.g., organization members).
**Action:** Use a single `for...of` loop with `if` conditions and `.push()` for data transformation when dealing with potentially large datasets to improve performance and memory usage.
