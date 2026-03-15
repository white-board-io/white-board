# white-board Development Patterns

> Auto-generated skill from repository analysis

## Overview

This skill covers development patterns for the white-board project, a TypeScript monorepo application with API functionality, authentication, and database operations. The codebase follows modern TypeScript practices with a modular architecture, comprehensive testing with Vitest, and database schema management using Drizzle ORM.

## Coding Conventions

### File Naming
- Use **camelCase** for all file names
- Test files follow the pattern `*.test.ts`
- Schema files are organized in `packages/database/src/schema/`
- Migration files use SQL format in `packages/database/drizzle/`

### Import/Export Style
```typescript
// Use relative imports
import { someFunction } from './utils'
import { AuthCommand } from '../commands/authCommand'

// Use named exports
export const validateUser = () => { /* ... */ }
export { UserSchema } from './schemas'
```

### Commit Conventions
- Use conventional commit prefixes: `feat:`, `fix:`, `chore:`, `refactor:`
- Keep commit messages around 56 characters
- Example: `feat: add user authentication command`

## Workflows

### Database Schema Migration
**Trigger:** When someone needs to change database structure
**Command:** `/migrate-schema`

1. Modify schema file in `packages/database/src/schema/`
2. Generate migration SQL file in `packages/database/drizzle/`
3. Update the snapshot.json file in `packages/database/drizzle/meta/`
4. Update the `_journal.json` to track migration history

```typescript
// Example schema modification
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow()
})
```

### API Command Testing
**Trigger:** When implementing or updating command testing coverage
**Command:** `/add-command-tests`

1. Create test files for auth commands in `apps/api/src/modules/auth/commands/*.test.ts`
2. Create test files for todo commands in `apps/api/src/modules/todo/commands/*.test.ts`
3. Add validation tests for input/output schemas
4. Update CI configuration in `.github/workflows/ci.yml`

```typescript
// Example test structure
describe('AuthCommand', () => {
  test('should validate user credentials', async () => {
    const command = new AuthCommand()
    const result = await command.execute(mockUserData)
    expect(result).toBeDefined()
  })
})
```

### Package Dependency Updates
**Trigger:** When updating dependencies or adding new packages
**Command:** `/update-deps`

1. Update package.json files across apps and packages
2. Update `bun.lock` file
3. Update `turbo.json` configuration if needed
4. Update CI configurations in `.github/workflows/ci.yml`

### Auth Module Development
**Trigger:** When adding new authentication features or commands
**Command:** `/add-auth-feature`

1. Create command files in `apps/api/src/modules/auth/commands/`
2. Update auth routes in `apps/api/src/routes/api/v1/auth/`
3. Add middleware if needed in `apps/api/src/modules/auth/middleware/`
4. Update schemas and validators in `apps/api/src/modules/auth/schemas/`

```typescript
// Example auth command structure
export class LoginCommand {
  async execute(credentials: LoginCredentials) {
    // Validation logic
    // Authentication logic
    // Return result
  }
}
```

### ESLint Configuration Updates
**Trigger:** When standardizing or updating linting rules
**Command:** `/update-eslint`

1. Update `eslint.config.mts` in all apps directories
2. Update `eslint.config.mts` in all packages directories
3. Ensure consistent configuration across the monorepo

## Testing Patterns

The project uses **Vitest** as the testing framework with the following patterns:

- Test files are named with `.test.ts` extension
- Tests are co-located with source files
- Focus on unit testing for command modules
- Use descriptive test names and proper mocking

```typescript
import { describe, test, expect } from 'vitest'

describe('CommandName', () => {
  test('should handle valid input correctly', () => {
    // Arrange
    // Act  
    // Assert
  })
})
```

## Commands

| Command | Purpose |
|---------|---------|
| `/migrate-schema` | Add or modify database schema with proper migrations |
| `/add-command-tests` | Add comprehensive unit tests for API command modules |
| `/update-deps` | Update package dependencies across the monorepo |
| `/add-auth-feature` | Implement authentication commands and related functionality |
| `/update-eslint` | Update ESLint configurations across multiple packages |