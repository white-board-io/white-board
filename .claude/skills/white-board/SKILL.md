---
name: white-board-conventions
description: Development conventions and patterns for white-board. TypeScript project with conventional commits.
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

Follow these commit message conventions based on 105 analyzed commits.

### Commit Style: Conventional Commits

### Prefixes Used

- `feat`
- `chore`
- `fix`
- `refactor`

### Message Guidelines

- Average message length: ~59 characters
- Keep first line concise and descriptive
- Use imperative mood ("Add feature" not "Added feature")


*Commit message example*

```text
feat: add white-board ECC bundle (.claude/commands/refactoring.md)
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
feat: add white-board ECC bundle (.claude/commands/feature-development.md)
```

*Commit message example*

```text
feat: add white-board ECC bundle (.claude/commands/database-migration.md)
```

*Commit message example*

```text
feat: add white-board ECC bundle (.codex/agents/docs-researcher.toml)
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

**Frequency**: ~4 times per month

**Steps**:
1. Create migration file
2. Update schema definitions
3. Generate/update types

**Files typically involved**:
- `**/schema.*`
- `migrations/*`

**Example commit sequence**:
```
feat: Add organization and member entities, roles, and a signup flow for organizations.
feat: Propagate authentication response headers from API commands to the client.
feat: Add active organization ID to user sessions and update authentication flows to manage it.
```

### Feature Development

Standard feature implementation workflow

**Frequency**: ~23 times per month

**Steps**:
1. Add feature implementation
2. Add tests for feature
3. Update documentation

**Files typically involved**:
- `apps/api/src/modules/auth/commands/*`
- `apps/api/src/modules/auth/utils/*`
- `packages/database/src/schema/*`
- `**/*.test.*`
- `**/api/**`

**Example commit sequence**:
```
feat: Add organization and member entities, roles, and a signup flow for organizations.
feat: Propagate authentication response headers from API commands to the client.
feat: Add active organization ID to user sessions and update authentication flows to manage it.
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
refactor: standardize error handling and operation outcomes using ServiceResult and ValidationResult.
refactor: standardize auth module error handling to return ServiceResult and introduce a new HTTP response utility.
feat: Add user existence check to organization signup and streamline auth API response schemas by removing success/data wrappers and standardizing error formats.
```

### Add Or Update Database Table Or Index

Adds or modifies a database table or index, including schema, migration SQL, and metadata snapshot updates.

**Frequency**: ~2 times per month

**Steps**:
1. Edit or create a schema file (e.g., packages/database/src/schema/*.ts)
2. Generate a migration SQL file (e.g., packages/database/drizzle/*.sql)
3. Update migration metadata (e.g., packages/database/drizzle/meta/*.json, _journal.json)

**Files typically involved**:
- `packages/database/src/schema/*.ts`
- `packages/database/drizzle/*.sql`
- `packages/database/drizzle/meta/*.json`
- `packages/database/drizzle/meta/_journal.json`

**Example commit sequence**:
```
Edit or create a schema file (e.g., packages/database/src/schema/*.ts)
Generate a migration SQL file (e.g., packages/database/drizzle/*.sql)
Update migration metadata (e.g., packages/database/drizzle/meta/*.json, _journal.json)
```

### Add Or Update Api Command With Tests

Implements or updates an API command handler and its corresponding unit tests.

**Frequency**: ~2 times per month

**Steps**:
1. Edit or create command handler file (e.g., apps/api/src/modules/*/commands/*.command.ts)
2. Edit or create corresponding unit test file (e.g., apps/api/src/modules/*/commands/*.command.test.ts)
3. Optionally update repository or utility files if logic changes

**Files typically involved**:
- `apps/api/src/modules/*/commands/*.command.ts`
- `apps/api/src/modules/*/commands/*.command.test.ts`
- `apps/api/src/modules/*/repository/*.ts`

**Example commit sequence**:
```
Edit or create command handler file (e.g., apps/api/src/modules/*/commands/*.command.ts)
Edit or create corresponding unit test file (e.g., apps/api/src/modules/*/commands/*.command.test.ts)
Optionally update repository or utility files if logic changes
```

### Add Or Update Api Endpoint Or Route

Adds or updates API route files and related query/validator files, often with supporting documentation.

**Frequency**: ~2 times per month

**Steps**:
1. Edit or create route file (e.g., apps/api/src/routes/api/v1/*/index.ts)
2. Edit or create query/validator files (e.g., apps/api/src/modules/*/queries/*.query.ts, validators/*.validator.ts)
3. Update documentation if needed (e.g., apps/api/docs/*.md)

**Files typically involved**:
- `apps/api/src/routes/api/v1/*/index.ts`
- `apps/api/src/modules/*/queries/*.query.ts`
- `apps/api/src/modules/*/validators/*.validator.ts`
- `apps/api/docs/*.md`

**Example commit sequence**:
```
Edit or create route file (e.g., apps/api/src/routes/api/v1/*/index.ts)
Edit or create query/validator files (e.g., apps/api/src/modules/*/queries/*.query.ts, validators/*.validator.ts)
Update documentation if needed (e.g., apps/api/docs/*.md)
```

### Add Or Update Unit Tests And Ci

Adds or updates unit tests for commands and configures CI to run them.

**Frequency**: ~2 times per month

**Steps**:
1. Edit or create unit test files (e.g., *.command.test.ts)
2. Update or add CI workflow configuration (e.g., .github/workflows/ci.yml)
3. Update test runner config if needed (e.g., vitest.config.ts, package.json)

**Files typically involved**:
- `apps/api/src/modules/*/commands/*.command.test.ts`
- `.github/workflows/ci.yml`
- `apps/api/vitest.config.ts`
- `apps/api/package.json`
- `package.json`

**Example commit sequence**:
```
Edit or create unit test files (e.g., *.command.test.ts)
Update or add CI workflow configuration (e.g., .github/workflows/ci.yml)
Update test runner config if needed (e.g., vitest.config.ts, package.json)
```

### Add Or Update Auth Flows And Entities

Implements or modifies authentication flows, organization/member entities, and related database schema.

**Frequency**: ~2 times per month

**Steps**:
1. Edit or create command files for auth (e.g., signup, signin, switch-organization)
2. Edit or create middleware and utility files for auth
3. Update database schema and migrations for auth-related tables
4. Update route files and propagate changes to client

**Files typically involved**:
- `apps/api/src/modules/auth/commands/*.command.ts`
- `apps/api/src/modules/auth/middleware/*.ts`
- `apps/api/src/modules/auth/utils/*.ts`
- `apps/api/src/routes/api/v1/auth/index.ts`
- `packages/database/src/schema/auth.ts`
- `packages/database/drizzle/*.sql`
- `packages/database/drizzle/meta/*.json`
- `packages/database/drizzle/meta/_journal.json`

**Example commit sequence**:
```
Edit or create command files for auth (e.g., signup, signin, switch-organization)
Edit or create middleware and utility files for auth
Update database schema and migrations for auth-related tables
Update route files and propagate changes to client
```

### Standardize Or Refactor Shared Logic

Refactors shared logic (e.g., error handling, validation, ESLint config) across multiple modules or packages for consistency.

**Frequency**: ~2 times per month

**Steps**:
1. Edit shared utility files (e.g., ServiceResult, ValidationResult, error mappers)
2. Edit ESLint or other config files across apps/packages
3. Update documentation to reflect new conventions

**Files typically involved**:
- `apps/api/src/utils/*.ts`
- `apps/api/docs/*.md`
- `apps/*/eslint.config.mts`
- `packages/*/eslint.config.mts`

**Example commit sequence**:
```
Edit shared utility files (e.g., ServiceResult, ValidationResult, error mappers)
Edit ESLint or other config files across apps/packages
Update documentation to reflect new conventions
```


## Best Practices

Based on analysis of the codebase, follow these practices:

### Do

- Use conventional commit format (feat:, fix:, etc.)
- Keep feature code co-located in feature folders
- Write tests using vitest
- Follow *.test.ts naming pattern
- Use camelCase for file names
- Prefer named exports

### Don't

- Don't write vague commit messages
- Don't skip tests for new features
- Don't deviate from established patterns without discussion

---

*This skill was auto-generated by [ECC Tools](https://ecc.tools). Review and customize as needed for your team.*
