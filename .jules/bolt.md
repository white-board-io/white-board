## 2025-01-16 - TS-Node vs ESM Compatibility
**Learning:** `ts-node` 10.x has known compatibility issues with newer TypeScript versions and ESM environments, causing `TypeError: state.conditions.includes is not a function`. This environment uses Node 22 and TypeScript 5.9.
**Action:** For verification, rely on compiling to JS or small standalone scripts when the test runner is broken. Do not try to fix the entire test runner infrastructure if not asked.

## 2025-01-16 - Pre-existing TS Errors in API
**Learning:** `apps/api` has existing TS build errors primarily in test files related to `ServiceResult` unions not being properly narrowed before asserting. These are known issues and can be ignored when testing optimization changes.
**Action:** Do not attempt to fix test typings unless directly related to modified code. Run `npm run test` instead to verify runtime correctness.

## 2025-01-16 - Pre-existing TS Errors in API
**Learning:** `apps/api` has existing TS build errors primarily in test files related to `ServiceResult` unions not being properly narrowed before asserting. These are known issues and can be ignored when testing optimization changes.
**Action:** Do not attempt to fix test typings unless directly related to modified code. Run `npm run test` instead to verify runtime correctness.
