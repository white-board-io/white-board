## 2025-01-16 - TS-Node vs ESM Compatibility
**Learning:** `ts-node` 10.x has known compatibility issues with newer TypeScript versions and ESM environments, causing `TypeError: state.conditions.includes is not a function`. This environment uses Node 22 and TypeScript 5.9.
**Action:** For verification, rely on compiling to JS or small standalone scripts when the test runner is broken. Do not try to fix the entire test runner infrastructure if not asked.
## 2025-01-16 - Atomic Database Operations for Performance
**Learning:** Using Drizzle ORM's `.returning()` and raw SQL queries (like `sql\`NOT ${table.column}\``) allows for atomic mutation operations. This approach eliminates redundant N+1 existence checks (e.g., calling `findById` before `update` or `delete`), reducing database round trips and improving performance.
**Action:** When implementing mutations (create, update, delete, toggle), rely on the database's ability to return the modified row atomically rather than checking for existence manually in the application code.
