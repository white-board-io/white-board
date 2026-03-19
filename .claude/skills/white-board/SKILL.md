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

Follow these commit message conventions based on 127 analyzed commits.

### Commit Style: Conventional Commits

### Prefixes Used

- `feat`
- `chore`
- `fix`
- `refactor`

### Message Guidelines

- Average message length: ~60 characters
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

**Frequency**: ~2 times per month

**Steps**:
1. Create migration file
2. Update schema definitions
3. Generate/update types

**Files typically involved**:
- `migrations/*`

**Example commit sequence**:
```
feat: add white-board ECC bundle (.claude/commands/database-migration.md)
feat: add white-board ECC bundle (.claude/commands/feature-development.md)
feat: add white-board ECC bundle (.claude/commands/refactoring.md)
```

### Feature Development

Standard feature implementation workflow

**Frequency**: ~30 times per month

**Steps**:
1. Add feature implementation
2. Add tests for feature
3. Update documentation

**Files typically involved**:
- `apps/api/src/modules/auth/commands/*`
- `apps/api/src/modules/todo/commands/*`
- `apps/api/*`
- `**/*.test.*`
- `**/api/**`

**Example commit sequence**:
```
Add zod validation coverage for command tests
Merge pull request #52 from white-board-io/codex/vitest-api
feat(api): optimize todo mutation commands
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
feat(api): optimize todo mutation commands
feat: add white-board ECC bundle (.claude/ecc-tools.json)
feat: add white-board ECC bundle (.claude/skills/white-board/SKILL.md)
```

### Add Or Update Ecc Bundle Command Docs

Adds or updates ECC bundle command documentation and configuration files for white-board, including feature development, database migration, and refactoring commands.

**Frequency**: ~3 times per month

**Steps**:
1. Add or update .claude/commands/feature-development.md
2. Add or update .claude/commands/database-migration.md
3. Add or update .claude/commands/refactoring.md

**Files typically involved**:
- `.claude/commands/feature-development.md`
- `.claude/commands/database-migration.md`
- `.claude/commands/refactoring.md`

**Example commit sequence**:
```
Add or update .claude/commands/feature-development.md
Add or update .claude/commands/database-migration.md
Add or update .claude/commands/refactoring.md
```

### Add Or Update Skill Documentation

Adds or updates SKILL.md documentation files for white-board skills in both .agents and .claude directories.

**Frequency**: ~2 times per month

**Steps**:
1. Add or update .agents/skills/white-board/SKILL.md
2. Add or update .claude/skills/white-board/SKILL.md

**Files typically involved**:
- `.agents/skills/white-board/SKILL.md`
- `.claude/skills/white-board/SKILL.md`

**Example commit sequence**:
```
Add or update .agents/skills/white-board/SKILL.md
Add or update .claude/skills/white-board/SKILL.md
```

### Add Or Update Codex Agent Configs

Adds or updates agent configuration files for docs-researcher, reviewer, and explorer agents in the .codex/agents directory.

**Frequency**: ~2 times per month

**Steps**:
1. Add or update .codex/agents/docs-researcher.toml
2. Add or update .codex/agents/reviewer.toml
3. Add or update .codex/agents/explorer.toml

**Files typically involved**:
- `.codex/agents/docs-researcher.toml`
- `.codex/agents/reviewer.toml`
- `.codex/agents/explorer.toml`

**Example commit sequence**:
```
Add or update .codex/agents/docs-researcher.toml
Add or update .codex/agents/reviewer.toml
Add or update .codex/agents/explorer.toml
```

### Add Or Update Identity And Tooling Configs

Adds or updates identity and ECC tools configuration files for white-board in the .claude directory.

**Frequency**: ~2 times per month

**Steps**:
1. Add or update .claude/identity.json
2. Add or update .claude/ecc-tools.json

**Files typically involved**:
- `.claude/identity.json`
- `.claude/ecc-tools.json`

**Example commit sequence**:
```
Add or update .claude/identity.json
Add or update .claude/ecc-tools.json
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
