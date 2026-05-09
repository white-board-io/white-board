## 2025-01-16 - TS-Node vs ESM Compatibility
**Learning:** `ts-node` 10.x has known compatibility issues with newer TypeScript versions and ESM environments, causing `TypeError: state.conditions.includes is not a function`. This environment uses Node 22 and TypeScript 5.9.
**Action:** For verification, rely on compiling to JS or small standalone scripts when the test runner is broken. Do not try to fix the entire test runner infrastructure if not asked.

## 2025-01-24 - Drizzle Query Builder Behavior
**Learning:** In Drizzle ORM query builders, consecutive calls to `.where()` overwrite previous conditions instead of merging them. For example, `query.where(A).where(B)` results in `WHERE B`.
**Action:** Always use the `and(...)` helper to combine multiple conditions explicitly: `query.where(and(A, B))`.
