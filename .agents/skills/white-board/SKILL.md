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

Follow these commit message conventions based on 94 analyzed commits.

### Commit Style: Conventional Commits

### Prefixes Used

- `feat`
- `chore`
- `fix`
- `refactor`

### Message Guidelines

- Average message length: ~58 characters
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
- `migrations/*`
- `**/schema.*`

**Example commit sequence**:
```
chore: Added skills for vercel/ gemini/ query client etc
chore: Updated roles repository
chore: Configure and updated bun to run the fastify server.
```

### Feature Development

Standard feature implementation workflow

**Frequency**: ~17 times per month

**Steps**:
1. Add feature implementation
2. Add tests for feature
3. Update documentation

**Files typically involved**:
- `apps/api/src/*`
- `apps/api/src/routes/api/v1/auth/*`
- `apps/api/src/routes/api/v1/todos/*`
- `**/*.test.*`
- `**/api/**`

**Example commit sequence**:
```
feat: Integrated swagger
fix: Addressed review comments
Merge pull request #33 from white-board-io/arun/configure-swagger
```

### Refactoring

Code refactoring and cleanup workflow

**Frequency**: ~4 times per month

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

### Add Or Update Database Entity And Migration

Adds or updates a database entity (table/schema) and generates corresponding migration and metadata files.

**Frequency**: ~2 times per month

**Steps**:
1. Edit or create a schema file in packages/database/src/schema/*.ts
2. Generate a migration SQL file in packages/database/drizzle/*.sql
3. Update migration metadata in packages/database/drizzle/meta/*.json
4. Update migration journal in packages/database/drizzle/meta/_journal.json

**Files typically involved**:
- `packages/database/src/schema/*.ts`
- `packages/database/drizzle/*.sql`
- `packages/database/drizzle/meta/*.json`
- `packages/database/drizzle/meta/_journal.json`

**Example commit sequence**:
```
Edit or create a schema file in packages/database/src/schema/*.ts
Generate a migration SQL file in packages/database/drizzle/*.sql
Update migration metadata in packages/database/drizzle/meta/*.json
Update migration journal in packages/database/drizzle/meta/_journal.json
```

### Api Command Or Query Implementation And Unit Tests

Implements or updates API command/query handlers and adds or updates their unit tests.

**Frequency**: ~2 times per month

**Steps**:
1. Edit or create command/query handler in apps/api/src/modules/*/commands/*.command.ts or apps/api/src/modules/*/queries/*.query.ts
2. Edit or create corresponding test in apps/api/src/modules/*/commands/*.command.test.ts
3. Optionally update repository or validator files in the same module

**Files typically involved**:
- `apps/api/src/modules/*/commands/*.command.ts`
- `apps/api/src/modules/*/commands/*.command.test.ts`
- `apps/api/src/modules/*/queries/*.query.ts`
- `apps/api/src/modules/*/validators/*.validator.ts`
- `apps/api/src/modules/*/repository/*.ts`

**Example commit sequence**:
```
Edit or create command/query handler in apps/api/src/modules/*/commands/*.command.ts or apps/api/src/modules/*/queries/*.query.ts
Edit or create corresponding test in apps/api/src/modules/*/commands/*.command.test.ts
Optionally update repository or validator files in the same module
```

### Add Or Update Api Route And Docs

Adds or updates API routes and related documentation or configuration.

**Frequency**: ~2 times per month

**Steps**:
1. Edit or create route handler in apps/api/src/routes/api/v1/*/*.ts
2. Update or add documentation in apps/api/docs/*.md
3. Update configuration files such as apps/api/package.json or apps/api/src/app.ts

**Files typically involved**:
- `apps/api/src/routes/api/v1/*/*.ts`
- `apps/api/docs/*.md`
- `apps/api/package.json`
- `apps/api/src/app.ts`

**Example commit sequence**:
```
Edit or create route handler in apps/api/src/routes/api/v1/*/*.ts
Update or add documentation in apps/api/docs/*.md
Update configuration files such as apps/api/package.json or apps/api/src/app.ts
```

### Ui Component Library Expansion

Adds or updates UI components and related styles in the shared UI package.

**Frequency**: ~2 times per month

**Steps**:
1. Create or update component files in packages/ui/src/components/ui/*.tsx
2. Edit shared styles in packages/ui/src/globals.css
3. Update package configuration in packages/ui/package.json or packages/ui/tsconfig.json

**Files typically involved**:
- `packages/ui/src/components/ui/*.tsx`
- `packages/ui/src/globals.css`
- `packages/ui/package.json`
- `packages/ui/tsconfig.json`

**Example commit sequence**:
```
Create or update component files in packages/ui/src/components/ui/*.tsx
Edit shared styles in packages/ui/src/globals.css
Update package configuration in packages/ui/package.json or packages/ui/tsconfig.json
```

### Eslint Config Standardization

Updates ESLint configuration files across multiple packages for consistency.

**Frequency**: ~2 times per month

**Steps**:
1. Edit eslint.config.mts or eslint.config.mjs in multiple apps or packages

**Files typically involved**:
- `apps/*/eslint.config.mts`
- `packages/*/eslint.config.mts`
- `packages/*/eslint.config.mjs`

**Example commit sequence**:
```
Edit eslint.config.mts or eslint.config.mjs in multiple apps or packages
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
