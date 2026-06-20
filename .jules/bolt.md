## 2025-01-16 - TS-Node vs ESM Compatibility
**Learning:** `ts-node` 10.x has known compatibility issues with newer TypeScript versions and ESM environments, causing `TypeError: state.conditions.includes is not a function`. This environment uses Node 22 and TypeScript 5.9.
**Action:** For verification, rely on compiling to JS or small standalone scripts when the test runner is broken. Do not try to fix the entire test runner infrastructure if not asked.

## 2025-01-16 - Atomic DB Mutations with Drizzle ORM
**Learning:** In Drizzle ORM, using `.returning()` alongside mutations (`delete`, `update`) completely eliminates the need for separate `findById` existence checks, cutting database queries in half and resolving concurrent request race conditions.
**Action:** When implementing database commands, always prioritize atomic mutations with `.returning()` over a read-then-write pattern.
