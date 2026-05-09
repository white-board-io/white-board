## 2025-01-16 - TS-Node vs ESM Compatibility
**Learning:** `ts-node` 10.x has known compatibility issues with newer TypeScript versions and ESM environments, causing `TypeError: state.conditions.includes is not a function`. This environment uses Node 22 and TypeScript 5.9.
**Action:** For verification, rely on compiling to JS or small standalone scripts when the test runner is broken. Do not try to fix the entire test runner infrastructure if not asked.

## 2025-01-16 - Array Iteration Performance
**Learning:** Performance benchmarks in Node.js v22/Bun v1.2 show that replacing a `.filter().map()` chain with a single `for...of` loop yields significant performance gains (~30-40%) on large arrays (10k+ items) by reducing traversals and intermediate array allocations.
**Action:** Always favor single-pass iterations like `for...of` over chained array methods for critical data processing paths, especially when array sizes can grow unexpectedly.
