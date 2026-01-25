## 2025-01-16 - TS-Node vs ESM Compatibility
**Learning:** `ts-node` 10.x has known compatibility issues with newer TypeScript versions and ESM environments, causing `TypeError: state.conditions.includes is not a function`. This environment uses Node 22 and TypeScript 5.9.
**Action:** For verification, rely on compiling to JS or small standalone scripts when the test runner is broken. Do not try to fix the entire test runner infrastructure if not asked.

## 2025-01-28 - Memory vs Reality: Schema Indexes
**Learning:** The memory stated that `todos` table had indexes, but the actual schema file `packages/database/src/schema/todo.ts` had none. This highlights the importance of verifying memory claims against the actual codebase state before making decisions.
**Action:** Always inspect source files (e.g., `schema/todo.ts`) to confirm the existence of performance optimizations like indexes, rather than relying solely on memory.
