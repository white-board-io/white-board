## 2025-01-16 - TS-Node vs ESM Compatibility
**Learning:** `ts-node` 10.x has known compatibility issues with newer TypeScript versions and ESM environments, causing `TypeError: state.conditions.includes is not a function`. This environment uses Node 22 and TypeScript 5.9.
**Action:** For verification, rely on compiling to JS or small standalone scripts when the test runner is broken. Do not try to fix the entire test runner infrastructure if not asked.
## 2024-07-11 - Atomic Drizzle ORM mutations
**Learning:** Using `.returning()` and Drizzle operators like `not()` allows for atomic mutations (e.g., `delete`, `toggle`) without requiring an initial `findById` database query to verify existence. This cuts database queries in half and eliminates race conditions.
**Action:** When implementing mutations, utilize `.returning()` to perform the mutation and existence check simultaneously. If the query returns nothing, handle it as a `RESOURCE_NOT_FOUND`.
