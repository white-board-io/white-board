## 2025-01-16 - TS-Node vs ESM Compatibility
**Learning:** `ts-node` 10.x has known compatibility issues with newer TypeScript versions and ESM environments, causing `TypeError: state.conditions.includes is not a function`. This environment uses Node 22 and TypeScript 5.9.
**Action:** For verification, rely on compiling to JS or small standalone scripts when the test runner is broken. Do not try to fix the entire test runner infrastructure if not asked.

## 2025-01-16 - Atomic Drizzle ORM mutations using returning()
**Learning:** For mutation operations like `delete` or `toggle` in Drizzle ORM, relying on an initial `findById` query to check for existence before performing the mutation adds unnecessary latency (an extra database round trip) and exposes the application to race conditions.
**Action:** Use Drizzle ORM's `.returning()` clause in combination with `.update()` and `.delete()` to execute mutations atomically. This allows you to check for existence and retrieve the modified/deleted data in a single query, improving performance and safety.
