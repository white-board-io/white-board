---
title: White Board - Educational Platform
description: Multi-tenant educational platform for schools, colleges, and training institutes
version: 1.0.0
---

![CodeRabbit Pull Request Reviews](https://img.shields.io/coderabbit/prs/github/white-board-io/white-board?utm_source=oss&utm_medium=github&utm_campaign=white-board-io%2Fwhite-board&labelColor=171717&color=FF570A&link=https%3A%2F%2Fcoderabbit.ai&label=CodeRabbit+Reviews)

# White Board

Multi-tenant educational platform built with TypeScript, designed for schools, colleges, training institutes, and tuition centers.

## Tech Stack

- **Runtime**: Bun
- **Monorepo**: Turborepo
- **API**: Fastify
- **Frontend**: TanStack Start
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: better-auth with RBAC

## Project Structure

```
white-board/
├── apps/
│   ├── api/          # Fastify REST API
│   ├── web/          # TanStack Start frontend
│   └── docs/         # Next.js documentation
├── packages/
│   ├── auth/         # Authentication with better-auth
│   ├── database/     # Drizzle ORM schemas and migrations
│   ├── ui/           # Shared React components
│   ├── eslint-config/
│   └── typescript-config/
```

## Packages

| Package | Description |
|---------|-------------|
| `@repo/auth` | Authentication with RBAC using better-auth |
| `@repo/database` | PostgreSQL schemas with Drizzle ORM |
| `@repo/ui` | Shared React component library |
| `@repo/eslint-config` | ESLint configurations |
| `@repo/typescript-config` | TypeScript configurations |

## Authentication

Multi-tenant authentication with organization-based RBAC.

### Default Roles

| Role | Description |
|------|-------------|
| `owner` | Full organization control |
| `admin` | Manage users, settings, content |
| `teacher` | Create/manage courses, grades, attendance |
| `student` | Access courses and learning materials |
| `parent` | View student progress |
| `staff` | Administrative tasks |

### Auth API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/signup` | Sign up with organization |
| POST | `/api/v1/auth/signin` | Sign in |
| POST | `/api/v1/auth/signout` | Sign out |
| GET | `/api/v1/auth/session` | Get current session with orgs |
| POST | `/api/v1/auth/forget-password` | Request password reset |
| POST | `/api/v1/auth/reset-password` | Reset password |
| POST | `/api/v1/auth/change-password` | Change password |
| PATCH | `/api/v1/auth/profile` | Update profile |

### Organization Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/auth/organizations/:id` | Get organization details |
| PATCH | `/api/v1/auth/organizations/:id` | Update organization |
| DELETE | `/api/v1/auth/organizations/:id` | Delete organization (soft) |
| POST | `/api/v1/auth/organizations/:id/switch` | Switch active org |
| GET | `/api/v1/auth/organizations/:id/members` | List members |
| DELETE | `/api/v1/auth/organizations/:id/members/:memberId` | Remove member |
| POST | `/api/v1/auth/organizations/:id/invitations` | Invite member |
| GET | `/api/v1/auth/organizations/:id/invitations` | List invitations |
| DELETE | `/api/v1/auth/organizations/:id/invitations/:invId` | Cancel invitation |
| POST | `/api/v1/auth/invitations/accept` | Accept invitation |

### Signup Request

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "organizationName": "ABC School",
  "organizationType": "school"
}
```

Organization types: `other`, `school`, `college`, `tuition`, `training_institute`

## Getting Started

### Prerequisites

- Bun 1.3+
- PostgreSQL 15+
- Node.js 18+ (for some tooling)

### Installation

```bash
bun install
```

### Database Setup

```bash
cd packages/database
bun run db:generate
bun run db:migrate
```

### Development

```bash
bun run dev
```

### Build

```bash
bun run build
```

### Lint

```bash
bun run lint
```

## Development Guidelines

### Code Style

This project follows strict coding conventions. Key principles:

1. **No Comments** - Write self-documenting code with clear, descriptive naming
2. **Use `type` not `interface`** - Always use TypeScript `type` for definitions
3. **Type imports** - Use `import type` for type-only imports
4. **Explicit return types** - All handlers must have explicit return types
5. **Thin route handlers** - Delegate to command/query handlers

See [apps/api/docs/coding-conventions.md](apps/api/docs/coding-conventions.md) for full guidelines.

### No Comments Policy

Code should be readable through proper naming, not comments. Comments are redundant when:

- Function names clearly describe what they do
- Variable names explain their purpose
- Type definitions document the data shape
- File names follow consistent patterns

```typescript
// Bad - comment explains what code does
// Create a new todo item
export async function create(input: unknown) { ... }

// Good - name is self-explanatory
export async function createTodoHandler(input: unknown) { ... }
```

```typescript
// Bad - comment explains variable
const t = 3600; // token expiry in seconds

// Good - name explains itself
const resetPasswordTokenExpiresInSeconds = 3600;
```

### File Naming

| Type | Pattern | Example |
|------|---------|---------|
| Command | `{action}-{resource}.command.ts` | `create-todo.command.ts` |
| Query | `{action}-{resource}.query.ts` | `get-all-todos.query.ts` |
| Schema | `{resource}.schema.ts` | `todo.schema.ts` |
| Repository | `{resource}.repository.ts` | `todo.repository.ts` |

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | required |
| `CLIENT_ORIGIN` | Frontend URL for CORS | `http://localhost:3000` |
| `NODE_ENV` | Environment mode | `development` |

## Documentation

- [Auth Endpoints](apps/api/docs/auth-endpoints.md)
- [Coding Conventions](apps/api/docs/coding-conventions.md)
- [CQRS Pattern](apps/api/docs/cqrs-pattern.md)
- [Creating Endpoints](apps/api/docs/creating-endpoints.md)
- [Error Handling](apps/api/docs/error-handling.md)
- [Folder Structure](apps/api/docs/folder-structure.md)
- [Logging](apps/api/docs/logging.md)
- [Schemas & Validation](apps/api/docs/schemas-validation.md)
