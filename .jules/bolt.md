## 2025-01-16 - TS-Node vs ESM Compatibility
**Learning:** `ts-node` 10.x has known compatibility issues with newer TypeScript versions and ESM environments, causing `TypeError: state.conditions.includes is not a function`. This environment uses Node 22 and TypeScript 5.9.
**Action:** For verification, rely on compiling to JS or small standalone scripts when the test runner is broken. Do not try to fix the entire test runner infrastructure if not asked.
## 2025-01-20 - Atomic Mutations to avoid N+1 and Redundant Existence Queries
**Learning:** Drizzle ORM's `.returning()` clause combined with raw SQL statements (e.g., `sql\`NOT \${table.column}\``) enables atomic mutations. Checking `findById` before updates or deletes creates redundant database hits. By assuming the existence and directly applying the mutation with `.returning()`, we can perform both the existence check and the mutation in a single round trip.
**Action:** Always prefer atomic mutation updates/deletes in Drizzle by capturing the returned result using `.returning()` rather than querying `findById` first, to save database trips and reduce latency.
