## 2025-01-16 - TS-Node vs ESM Compatibility
**Learning:** `ts-node` 10.x has known compatibility issues with newer TypeScript versions and ESM environments, causing `TypeError: state.conditions.includes is not a function`. This environment uses Node 22 and TypeScript 5.9.
**Action:** For verification, rely on compiling to JS or small standalone scripts when the test runner is broken. Do not try to fix the entire test runner infrastructure if not asked.

## 2025-01-16 - Atomic Database Operations in API Handlers
**Learning:** In Drizzle ORM, using `.returning()` (and the `not()` operator for booleans) allows for atomic mutation of records (like delete, update, and toggle). This avoids an initial `findById` database query to verify existence, directly cutting database round trips in half for these operations. Additionally, moving Zod input validation strictly before any database interaction avoids unnecessary database query overhead for invalid requests.
**Action:** When implementing mutation handlers, always prioritize atomic mutations with `.returning()` over existence checks, and strictly position input validation as the first step before querying the database.
