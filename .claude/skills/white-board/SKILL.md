---
name: white-board-conventions
description: Development conventions and patterns for white-board. TypeScript project with mixed commits.
---

# White Board Conventions

> Generated from [white-board-io/white-board](https://github.com/white-board-io/white-board) on 2026-03-19

## Overview

This skill teaches Claude the development patterns and conventions used in white-board.

## Tech Stack

- **Primary Language**: TypeScript
- **Architecture**: feature-based module organization
- **Test Location**: mixed
- **Test Framework**: vitest

## When to Use This Skill

Activate this skill when:
- Making changes to this repository
- Adding new features following established patterns
- Writing tests that match project conventions
- Creating commits with proper message format

## Commit Conventions

Follow these commit message conventions based on 80 analyzed commits.

### Commit Style: Mixed Style

### Prefixes Used

- `chore`
- `feat`
- `fix`
- `refactor`

### Message Guidelines

- Average message length: ~56 characters
- Keep first line concise and descriptive
- Use imperative mood ("Add feature" not "Added feature")


*Commit message example*

```text
feat(api): optimize todo mutation commands
```

*Commit message example*

```text
refactor: Update ESLint configurations across multiple packages to include dynamic `tsconfigRootDir` based on file location
```

*Commit message example*

```text
style: Update button styles and theme colors for improved UI consistency
```

*Commit message example*

```text
fix: Added animation for `eyeoff` and `eye` icon toggle.
```

*Commit message example*

```text
chore: delete example API route.
```

*Commit message example*

```text
Merge pull request #52 from white-board-io/codex/vitest-api
```

*Commit message example*

```text
Add zod validation coverage for command tests
```

*Commit message example*

```text
Add command unit tests and CI test job
```

## Architecture

### Project Structure: Turborepo

This project uses **feature-based** module organization.

### Configuration Files

- `.agents/skills/tanstack-query/templates/package.json`
- `.github/workflows/ci.yml`
- `apps/api/package.json`
- `apps/api/test/tsconfig.json`
- `apps/api/tsconfig.json`
- `apps/api/vitest.config.ts`
- `apps/docs/next.config.js`
- `apps/docs/package.json`
- `apps/docs/tsconfig.json`
- `apps/web/package.json`
- `apps/web/tsconfig.json`
- `apps/web/vite.config.ts`
- `package.json`
- `packages/auth/package.json`
- `packages/auth/tsconfig.json`
- `packages/database/drizzle.config.ts`
- `packages/database/package.json`
- `packages/database/tsconfig.json`
- `packages/eslint-config/package.json`
- `packages/typescript-config/package.json`
- `packages/ui/package.json`
- `packages/ui/tsconfig.json`

### Guidelines

- Group related code by feature/domain
- Each feature folder should be self-contained
- Shared utilities go in a common/shared folder

## Code Style

### Language: TypeScript

### Naming Conventions

| Element | Convention |
|---------|------------|
| Files | camelCase |
| Functions | camelCase |
| Classes | PascalCase |
| Constants | SCREAMING_SNAKE_CASE |

### Import Style: Relative Imports

### Export Style: Named Exports


*Preferred import style*

```typescript
// Use relative imports
import { Button } from '../components/Button'
import { useAuth } from './hooks/useAuth'
```

*Preferred export style*

```typescript
// Use named exports
export function calculateTotal() { ... }
export const TAX_RATE = 0.1
export interface Order { ... }
```

## Testing

### Test Framework: vitest

### File Pattern: `*.test.ts`

### Test Types

- **Unit tests**: Test individual functions and components in isolation
- **Integration tests**: Test interactions between multiple components/services

### Mocking: vi.mock


*Test file structure*

```typescript
import { describe, it, expect } from 'vitest'

describe('MyFunction', () => {
  it('should return expected result', () => {
    const result = myFunction(input)
    expect(result).toBe(expected)
  })
})
```

## Error Handling

### Error Handling Style: Error Boundaries

React **Error Boundaries** are used for graceful UI error handling.


## Common Workflows

These workflows were detected from analyzing commit patterns.

### Database Migration

Database schema changes with migration files

**Frequency**: ~5 times per month

**Steps**:
1. Create migration file
2. Update schema definitions
3. Generate/update types

**Files typically involved**:
- `**/schema.*`
- `migrations/*`

**Example commit sequence**:
```
Merge pull request #9 from white-board-io/dynamic-rbac-8626716045509101620
Merge branch 'main' into setup-shadcn-ui-17901637440597929696
chore: Updated bun.lock
```

### Feature Development

Standard feature implementation workflow

**Frequency**: ~10 times per month

**Steps**:
1. Add feature implementation
2. Add tests for feature
3. Update documentation

**Files typically involved**:
- `apps/api/src/modules/auth/commands/*`
- `apps/api/src/modules/auth/middleware/*`
- `apps/api/src/modules/auth/queries/*`
- `**/*.test.*`
- `**/api/**`

**Example commit sequence**:
```
Merge pull request #9 from white-board-io/dynamic-rbac-8626716045509101620
Merge branch 'main' into setup-shadcn-ui-17901637440597929696
chore: Updated bun.lock
```

### Refactoring

Code refactoring and cleanup workflow

**Frequency**: ~5 times per month

**Steps**:
1. Ensure tests pass before refactor
2. Refactor code structure
3. Verify tests still pass

**Files typically involved**:
- `src/**/*`

**Example commit sequence**:
```
chore: update typescript and fastify versions
Merge pull request #16 from white-board-io/update-typescript-fastify-8624900904337714054
refactor: separate repository and validator layers
```

### Add Or Update Database Table Or Index

Adds or modifies a database table or index, including schema changes and migration files.

**Frequency**: ~2 times per month

**Steps**:
1. Edit or create a file in packages/database/src/schema/*.ts to define or update the table structure.
2. Generate a new migration SQL file in packages/database/drizzle/*.sql.
3. Update migration metadata in packages/database/drizzle/meta/*.json.
4. Update packages/database/drizzle/meta/_journal.json to track applied migrations.

**Files typically involved**:
- `packages/database/src/schema/*.ts`
- `packages/database/drizzle/*.sql`
- `packages/database/drizzle/meta/*.json`
- `packages/database/drizzle/meta/_journal.json`

**Example commit sequence**:
```
Edit or create a file in packages/database/src/schema/*.ts to define or update the table structure.
Generate a new migration SQL file in packages/database/drizzle/*.sql.
Update migration metadata in packages/database/drizzle/meta/*.json.
Update packages/database/drizzle/meta/_journal.json to track applied migrations.
```

### Add Or Update Api Command Or Query

Implements or updates an API command/query handler, often with associated tests and validators.

**Frequency**: ~3 times per month

**Steps**:
1. Create or update command/query handler in apps/api/src/modules/*/commands/*.command.ts or apps/api/src/modules/*/queries/*.query.ts.
2. Update or add corresponding validator in apps/api/src/modules/*/validators/*.validator.ts.
3. Update or add repository logic in apps/api/src/modules/*/repository/*.repository.ts.
4. Update or add tests in apps/api/src/modules/*/commands/*.command.test.ts or apps/api/src/modules/*/queries/*.query.test.ts.

**Files typically involved**:
- `apps/api/src/modules/*/commands/*.command.ts`
- `apps/api/src/modules/*/queries/*.query.ts`
- `apps/api/src/modules/*/validators/*.validator.ts`
- `apps/api/src/modules/*/repository/*.repository.ts`
- `apps/api/src/modules/*/commands/*.command.test.ts`
- `apps/api/src/modules/*/queries/*.query.test.ts`

**Example commit sequence**:
```
Create or update command/query handler in apps/api/src/modules/*/commands/*.command.ts or apps/api/src/modules/*/queries/*.query.ts.
Update or add corresponding validator in apps/api/src/modules/*/validators/*.validator.ts.
Update or add repository logic in apps/api/src/modules/*/repository/*.repository.ts.
Update or add tests in apps/api/src/modules/*/commands/*.command.test.ts or apps/api/src/modules/*/queries/*.query.test.ts.
```

### Add Or Update Api Route

Adds or updates an API route, connecting it to commands/queries and updating documentation.

**Frequency**: ~2 times per month

**Steps**:
1. Create or update route handler in apps/api/src/routes/api/v1/*/index.ts or similar.
2. Connect route to command/query handlers.
3. Update or add OpenAPI/Swagger documentation if needed.
4. Update or add tests for the route.

**Files typically involved**:
- `apps/api/src/routes/api/v1/*/index.ts`
- `apps/api/src/routes/api/v1/*/*.ts`
- `apps/api/src/modules/*/commands/*.command.ts`
- `apps/api/src/modules/*/queries/*.query.ts`
- `apps/api/docs/*.md`

**Example commit sequence**:
```
Create or update route handler in apps/api/src/routes/api/v1/*/index.ts or similar.
Connect route to command/query handlers.
Update or add OpenAPI/Swagger documentation if needed.
Update or add tests for the route.
```

### Add Or Update Unit Tests For Commands

Adds or updates unit tests for API command handlers, often in bulk for a module.

**Frequency**: ~2 times per month

**Steps**:
1. Create or update test files in apps/api/src/modules/*/commands/*.command.test.ts.
2. Optionally update test configuration (e.g., vitest config).
3. Optionally update CI configuration to run tests.

**Files typically involved**:
- `apps/api/src/modules/*/commands/*.command.test.ts`
- `apps/api/vitest.config.ts`
- `.github/workflows/ci.yml`

**Example commit sequence**:
```
Create or update test files in apps/api/src/modules/*/commands/*.command.test.ts.
Optionally update test configuration (e.g., vitest config).
Optionally update CI configuration to run tests.
```

### Standardize Or Refactor Error Handling

Refactors code to standardize error handling and operation outcomes, often introducing or updating utility types and helpers.

**Frequency**: ~2 times per month

**Steps**:
1. Update command/query handlers to use ServiceResult or ValidationResult types.
2. Update or create utility files (e.g., apps/api/src/utils/ServiceResult.ts, ValidationResult.ts, mapZodErrors.ts).
3. Update route handlers to use new error handling utilities.
4. Update documentation to reflect new conventions.

**Files typically involved**:
- `apps/api/src/modules/*/commands/*.command.ts`
- `apps/api/src/modules/*/queries/*.query.ts`
- `apps/api/src/utils/ServiceResult.ts`
- `apps/api/src/utils/ValidationResult.ts`
- `apps/api/src/utils/mapZodErrors.ts`
- `apps/api/docs/*.md`

**Example commit sequence**:
```
Update command/query handlers to use ServiceResult or ValidationResult types.
Update or create utility files (e.g., apps/api/src/utils/ServiceResult.ts, ValidationResult.ts, mapZodErrors.ts).
Update route handlers to use new error handling utilities.
Update documentation to reflect new conventions.
```


## Best Practices

Based on analysis of the codebase, follow these practices:

### Do

- Keep feature code co-located in feature folders
- Write tests using vitest
- Follow *.test.ts naming pattern
- Use camelCase for file names
- Prefer named exports

### Don't

- Don't skip tests for new features
- Don't deviate from established patterns without discussion

---

*This skill was auto-generated by [ECC Tools](https://ecc.tools). Review and customize as needed for your team.*
