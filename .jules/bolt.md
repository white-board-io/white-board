## 2024-05-18 - Atomic updates to avoid redundant existence checks
**Learning:** In Drizzle ORM mutations (like \`delete\`, \`update\`), we can use the \`.returning()\` clause to avoid initial \`findById\` existence checks. When updating toggles, using \`not(column)\` prevents an initial query to determine the current value.
**Action:** Next time I modify command handlers, rely on the result of the mutation rather than a prior findById check to handle 404 (RESOURCE_NOT_FOUND) cases.
