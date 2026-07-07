## 2025-01-16 - TS-Node vs ESM Compatibility
**Learning:** `ts-node` 10.x has known compatibility issues with newer TypeScript versions and ESM environments, causing `TypeError: state.conditions.includes is not a function`. This environment uses Node 22 and TypeScript 5.9.
**Action:** For verification, rely on compiling to JS or small standalone scripts when the test runner is broken. Do not try to fix the entire test runner infrastructure if not asked.
## 2025-01-16 - Atomic Mutations vs Error Handling
**Learning:** When removing initial `findById` existence checks to rely on atomic Drizzle ORM mutations (e.g. returning undefined on update/delete), completely removing the 'not found' error block breaks the API contract. The mutation handles the existence check safely, but the command handler must still manually return the expected `RESOURCE_NOT_FOUND` error if the mutation returns undefined.
**Action:** Always verify that replacing an existence check with an atomic mutation retains the original 'Not Found' error response for the end user instead of deleting the error block entirely.
