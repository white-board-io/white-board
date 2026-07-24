## 2025-01-16 - TS-Node vs ESM Compatibility
**Learning:** `ts-node` 10.x has known compatibility issues with newer TypeScript versions and ESM environments, causing `TypeError: state.conditions.includes is not a function`. This environment uses Node 22 and TypeScript 5.9.
**Action:** For verification, rely on compiling to JS or small standalone scripts when the test runner is broken. Do not try to fix the entire test runner infrastructure if not asked.
## 2025-01-20 - Atomic Database Operations in Command Handlers
**Learning:** Command handlers in `apps/api` often perform a redundant `findById` existence check before an atomic mutation like `delete()`. Drizzle ORM's `returning()` clause allows these mutations to return data or indicate success (e.g., returning true/false or undefined). Using this eliminates a redundant database query and prevents race conditions.
**Action:** When optimizing command handlers, always check if initial `findById` reads can be replaced by relying on the return value of an atomic database mutation, but ensure to explicitly handle `false` or `undefined` returns to maintain correct `RESOURCE_NOT_FOUND` error responses.
