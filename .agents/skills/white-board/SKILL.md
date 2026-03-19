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

Follow these commit message conventions based on 138 analyzed commits.

### Commit Style: Conventional Commits

### Prefixes Used

- `feat`
- `chore`
- `fix`
- `refactor`

### Message Guidelines

- Average message length: ~61 characters
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

**Example commit sequence**:
```
feat: add white-board ECC bundle (.codex/agents/reviewer.toml)
feat: add white-board ECC bundle (.codex/agents/docs-researcher.toml)
feat: add white-board ECC bundle (.claude/homunculus/instincts/inherited/white-board-instincts.yaml)
```

### Add Command Documentation

Adds or updates a command documentation file for the white-board ECC bundle.

**Frequency**: ~5 times per month

**Steps**:
1. Create or update a Markdown file in .claude/commands/ (e.g., feature-development.md, database-migration.md, refactoring.md)
2. Commit the file with a message referencing the command and ECC bundle

**Files typically involved**:
- `.claude/commands/feature-development.md`
- `.claude/commands/database-migration.md`
- `.claude/commands/refactoring.md`

**Example commit sequence**:
```
Create or update a Markdown file in .claude/commands/ (e.g., feature-development.md, database-migration.md, refactoring.md)
Commit the file with a message referencing the command and ECC bundle
```

### Add Skill Documentation

Adds or updates SKILL.md documentation for a white-board skill in both .agents and .claude directories.

**Frequency**: ~4 times per month

**Steps**:
1. Create or update .agents/skills/white-board/SKILL.md
2. Create or update .claude/skills/white-board/SKILL.md
3. Commit both files with a message referencing the ECC bundle

**Files typically involved**:
- `.agents/skills/white-board/SKILL.md`
- `.claude/skills/white-board/SKILL.md`

**Example commit sequence**:
```
Create or update .agents/skills/white-board/SKILL.md
Create or update .claude/skills/white-board/SKILL.md
Commit both files with a message referencing the ECC bundle
```

### Add Codex Agent Config

Adds or updates agent configuration TOML files for Codex agents (docs-researcher, reviewer, explorer).

**Frequency**: ~5 times per month

**Steps**:
1. Create or update .codex/agents/docs-researcher.toml
2. Create or update .codex/agents/reviewer.toml
3. Create or update .codex/agents/explorer.toml
4. Commit the relevant files with a message referencing the ECC bundle

**Files typically involved**:
- `.codex/agents/docs-researcher.toml`
- `.codex/agents/reviewer.toml`
- `.codex/agents/explorer.toml`

**Example commit sequence**:
```
Create or update .codex/agents/docs-researcher.toml
Create or update .codex/agents/reviewer.toml
Create or update .codex/agents/explorer.toml
Commit the relevant files with a message referencing the ECC bundle
```

### Update Identity And Tools

Updates the identity and ECC tools configuration for the white-board ECC bundle.

**Frequency**: ~4 times per month

**Steps**:
1. Create or update .claude/identity.json
2. Create or update .claude/ecc-tools.json
3. Commit the relevant files with a message referencing the ECC bundle

**Files typically involved**:
- `.claude/identity.json`
- `.claude/ecc-tools.json`

**Example commit sequence**:
```
Create or update .claude/identity.json
Create or update .claude/ecc-tools.json
Commit the relevant files with a message referencing the ECC bundle
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
