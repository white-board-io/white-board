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

Follow these commit message conventions based on 116 analyzed commits.

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

**Frequency**: ~3 times per month

**Steps**:
1. Create migration file
2. Update schema definitions
3. Generate/update types

**Files typically involved**:
- `**/schema.*`
- `migrations/*`

**Example commit sequence**:
```
⚡ Bolt: Add database indexes for todos
⚡ Bolt: Add database indexes for todos
Merge pull request #50 from white-board-io/bolt/add-todo-indexes-8558514873253853618
```

### Feature Development

Standard feature implementation workflow

**Frequency**: ~27 times per month

**Steps**:
1. Add feature implementation
2. Add tests for feature
3. Update documentation

**Files typically involved**:
- `apps/web/src/routes/sign-in/components/*`
- `apps/web/src/routes/sign-in/*`
- `packages/database/src/schema/*`
- `**/*.test.*`
- `**/api/**`

**Example commit sequence**:
```
feat: Implement sign-in form with logo and password visibility toggle
fix: Fixed `showPassword` for showing password in the textbox.
fix: Added animation for `eyeoff` and `eye` icon toggle.
```

### Refactoring

Code refactoring and cleanup workflow

**Frequency**: ~3 times per month

**Steps**:
1. Ensure tests pass before refactor
2. Refactor code structure
3. Verify tests still pass

**Files typically involved**:
- `src/**/*`

**Example commit sequence**:
```
refactor: Update ESLint configurations across multiple packages to include dynamic `tsconfigRootDir` based on file location
Merge pull request #36 from white-board-io/arun/login-page-integration
⚡ Bolt: Add database indexes for todos
```

### Add Or Update Ecc Bundle

Adds or updates ECC (Extensible Command Collection) bundle files for white-board, including commands, skills, agent configs, and identity/tools files.

**Frequency**: ~4 times per month

**Steps**:
1. Add or update .claude/commands/*.md files (such as feature-development.md, database-migration.md, refactoring.md)
2. Add or update .claude/skills/white-board/SKILL.md
3. Add or update .agents/skills/white-board/SKILL.md
4. Add or update .codex/agents/*.toml (docs-researcher.toml, reviewer.toml, explorer.toml)
5. Add or update .claude/identity.json
6. Add or update .claude/ecc-tools.json
7. Add or update .agents/skills/white-board/agents/openai.yaml

**Files typically involved**:
- `.claude/commands/feature-development.md`
- `.claude/commands/database-migration.md`
- `.claude/commands/refactoring.md`
- `.claude/skills/white-board/SKILL.md`
- `.agents/skills/white-board/SKILL.md`
- `.codex/agents/docs-researcher.toml`
- `.codex/agents/reviewer.toml`
- `.codex/agents/explorer.toml`
- `.claude/identity.json`
- `.claude/ecc-tools.json`
- `.agents/skills/white-board/agents/openai.yaml`

**Example commit sequence**:
```
Add or update .claude/commands/*.md files (such as feature-development.md, database-migration.md, refactoring.md)
Add or update .claude/skills/white-board/SKILL.md
Add or update .agents/skills/white-board/SKILL.md
Add or update .codex/agents/*.toml (docs-researcher.toml, reviewer.toml, explorer.toml)
Add or update .claude/identity.json
Add or update .claude/ecc-tools.json
Add or update .agents/skills/white-board/agents/openai.yaml
```

### Add Or Update Database Schema And Migrations

Adds or modifies database schema files and generates corresponding migration SQL and metadata files.

**Frequency**: ~2 times per month

**Steps**:
1. Edit or add schema file (e.g., packages/database/src/schema/*.ts)
2. Generate migration SQL file (e.g., packages/database/drizzle/*.sql)
3. Update migration metadata (e.g., packages/database/drizzle/meta/*.json)
4. Update migration journal (e.g., packages/database/drizzle/meta/_journal.json)

**Files typically involved**:
- `packages/database/src/schema/todo.ts`
- `packages/database/drizzle/*.sql`
- `packages/database/drizzle/meta/*.json`
- `packages/database/drizzle/meta/_journal.json`

**Example commit sequence**:
```
Edit or add schema file (e.g., packages/database/src/schema/*.ts)
Generate migration SQL file (e.g., packages/database/drizzle/*.sql)
Update migration metadata (e.g., packages/database/drizzle/meta/*.json)
Update migration journal (e.g., packages/database/drizzle/meta/_journal.json)
```

### Add Or Update Api Command Unit Tests

Adds or updates unit tests for API command handlers, especially for authentication and todo modules.

**Frequency**: ~3 times per month

**Steps**:
1. Add or update test files for each command (e.g., create-todo.command.test.ts, accept-invitation.command.test.ts)
2. Optionally update CI workflow to include new tests (.github/workflows/ci.yml)
3. Update or add Vitest configuration (apps/api/vitest.config.ts)
4. Add or update package.json/test-related config if needed

**Files typically involved**:
- `apps/api/src/modules/auth/commands/*.command.test.ts`
- `apps/api/src/modules/todo/commands/*.command.test.ts`
- `.github/workflows/ci.yml`
- `apps/api/vitest.config.ts`
- `apps/api/package.json`

**Example commit sequence**:
```
Add or update test files for each command (e.g., create-todo.command.test.ts, accept-invitation.command.test.ts)
Optionally update CI workflow to include new tests (.github/workflows/ci.yml)
Update or add Vitest configuration (apps/api/vitest.config.ts)
Add or update package.json/test-related config if needed
```

### Feature Development Ui Auth Sign In

Implements or updates the sign-in UI, including form logic, assets, and style improvements.

**Frequency**: ~2 times per month

**Steps**:
1. Add or update sign-in form component (apps/web/src/routes/sign-in/components/sign-in-form.tsx)
2. Add or update sign-in page (apps/web/src/routes/sign-in/index.tsx)
3. Add or update logo and banner assets (apps/web/public/images/whiteboard-logo.svg, sign-in-banner.jpg)
4. Update route tree if necessary (apps/web/src/routeTree.gen.ts)
5. Update or add styles (packages/ui/src/components/ui/button.tsx, packages/ui/src/globals.css)
6. Optionally add or update UI text components

**Files typically involved**:
- `apps/web/src/routes/sign-in/components/sign-in-form.tsx`
- `apps/web/src/routes/sign-in/index.tsx`
- `apps/web/public/images/whiteboard-logo.svg`
- `apps/web/public/images/sign-in-banner.jpg`
- `apps/web/src/routeTree.gen.ts`
- `packages/ui/src/components/ui/button.tsx`
- `packages/ui/src/globals.css`

**Example commit sequence**:
```
Add or update sign-in form component (apps/web/src/routes/sign-in/components/sign-in-form.tsx)
Add or update sign-in page (apps/web/src/routes/sign-in/index.tsx)
Add or update logo and banner assets (apps/web/public/images/whiteboard-logo.svg, sign-in-banner.jpg)
Update route tree if necessary (apps/web/src/routeTree.gen.ts)
Update or add styles (packages/ui/src/components/ui/button.tsx, packages/ui/src/globals.css)
Optionally add or update UI text components
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
