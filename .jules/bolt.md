## 2025-01-16 - TS-Node vs ESM Compatibility
**Learning:** `ts-node` 10.x has known compatibility issues with newer TypeScript versions and ESM environments, causing `TypeError: state.conditions.includes is not a function`. This environment uses Node 22 and TypeScript 5.9.
**Action:** For verification, rely on compiling to JS or small standalone scripts when the test runner is broken. Do not try to fix the entire test runner infrastructure if not asked.

## 2025-01-20 - Drizzle Index Defaults
**Learning:** Drizzle's `.desc()` on a column in an index definition generates `DESC NULLS LAST` by default in Postgres (unlike standard SQL `ORDER BY DESC` which is `NULLS FIRST`). This mismatch can prevent index usage.
**Action:** Use `.desc().nullsFirst()` in Drizzle index definitions to match standard `ORDER BY ... DESC` query patterns.

## 2025-01-20 - Drizzle Migration Squashing
**Learning:** Squashing migrations manually requires editing `_journal.json` in `drizzle/meta` to remove reverted entries, otherwise `db:generate` assumes the old state persists.
**Action:** When reverting migrations, ensure `_journal.json` and snapshots are also cleaned up.
