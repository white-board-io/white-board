---
title: Folder Structure
description: Project organization and file locations for the API
category: architecture
---

# Folder Structure

This document describes the project organization and the purpose of each directory.

## Root Structure

```
apps/api/
├── src/                      # Source code
├── test/                     # Test files
├── dist/                     # Compiled JavaScript (generated)
├── docs/                     # Documentation
├── package.json
└── tsconfig.json
```

## Source Directory (`src/`)

```
src/
├── app.ts                    # Application entry point & plugin registration
├── modules/                  # Feature modules (business logic)
├── routes/                   # HTTP route handlers (file-based routing)
├── plugins/                  # Fastify plugins
└── shared/                   # Shared utilities and types
```

## Modules Directory (`src/modules/`)

Each feature is organized as a module with CQRS separation:

```
modules/
└── {module-name}/
    ├── commands/             # Write operations (create, update, delete)
    │   ├── create-{name}.command.ts
    │   ├── update-{name}.command.ts
    │   └── delete-{name}.command.ts
    ├── queries/              # Read operations
    │   ├── get-all-{names}.query.ts
    │   └── get-{name}-by-id.query.ts
    ├── schemas/              # Zod schemas and type definitions
    │   └── {name}.schema.ts
    ├── validators/           # Business validation rules
    │   └── {name}.validator.ts
    └── repository/           # Data access layer
        └── {name}.repository.ts
```

### Example: Todo Module

```
modules/todo/
├── commands/
│   ├── create-todo.command.ts    # POST /api/v1/todos
│   ├── update-todo.command.ts    # PUT /api/v1/todos/:id
│   ├── delete-todo.command.ts    # DELETE /api/v1/todos/:id
│   └── toggle-todo.command.ts    # PATCH /api/v1/todos/:id/toggle
├── queries/
│   ├── get-all-todos.query.ts    # GET /api/v1/todos
│   └── get-todo-by-id.query.ts   # GET /api/v1/todos/:id
├── schemas/
│   └── todo.schema.ts
├── validators/
│   └── todo.validator.ts
└── repository/
    └── todo.repository.ts
```

### Example: Auth Module

```
modules/auth/
├── commands/
│   ├── signup-with-org.command.ts      # POST /api/v1/auth/signup
│   ├── signin.command.ts               # POST /api/v1/auth/signin
│   ├── signout.command.ts              # POST /api/v1/auth/signout
│   ├── forget-password.command.ts      # POST /api/v1/auth/forget-password
│   ├── reset-password.command.ts       # POST /api/v1/auth/reset-password
│   ├── change-password.command.ts      # POST /api/v1/auth/change-password
│   ├── update-profile.command.ts       # PATCH /api/v1/auth/profile
│   ├── update-organization.command.ts  # PATCH /api/v1/auth/organizations/:id
│   ├── delete-organization.command.ts  # DELETE /api/v1/auth/organizations/:id
│   ├── switch-organization.command.ts  # POST /api/v1/auth/organizations/:id/switch
│   ├── invite-member.command.ts        # POST /api/v1/auth/organizations/:id/invitations
│   ├── accept-invitation.command.ts    # POST /api/v1/auth/invitations/accept
│   ├── cancel-invitation.command.ts    # DELETE /api/v1/auth/organizations/:id/invitations/:invId
│   └── remove-member.command.ts        # DELETE /api/v1/auth/organizations/:id/members/:memberId
├── queries/
│   ├── get-session.query.ts            # GET /api/v1/auth/session
│   ├── get-organization.query.ts       # GET /api/v1/auth/organizations/:id
│   ├── list-members.query.ts           # GET /api/v1/auth/organizations/:id/members
│   └── list-invitations.query.ts       # GET /api/v1/auth/organizations/:id/invitations
├── middleware/
│   └── require-auth.middleware.ts      # Auth & permission checks
└── schemas/
    └── auth.schema.ts
```

## Routes Directory (`src/routes/`)

File-based routing - directory structure determines URL paths:

```
routes/
├── root.ts                   # GET /
└── api/
    └── v1/
        ├── auth/
        │   └── index.ts      # All /api/v1/auth/* routes
        └── todos/
            └── index.ts      # All /api/v1/todos/* routes
```

### Route File Naming

| File Path | URL Path |
|-----------|----------|
| `routes/root.ts` | `/` |
| `routes/api/v1/auth/index.ts` | `/api/v1/auth/*` |
| `routes/api/v1/todos/index.ts` | `/api/v1/todos` |
| `routes/api/v1/users/index.ts` | `/api/v1/users` |
| `routes/health/index.ts` | `/health` |

## Plugins Directory (`src/plugins/`)

Fastify plugins for cross-cutting concerns:

```
plugins/
├── auth.ts                   # better-auth integration
├── cors.ts                   # CORS configuration
├── logger.ts                 # Structured logging helpers
├── sensible.ts               # HTTP error utilities
└── support.ts                # Custom decorators
```

## Shared Directory (`src/shared/`)

Shared utilities used across modules:

```
shared/
├── errors/
│   └── app-error.ts          # AppError class & factory functions
└── utils/
    └── error-handler.ts      # Route error handler
```

## Test Directory (`test/`)

Test files mirror the source structure:

```
test/
├── helper.ts                 # Test utilities
├── plugins/
│   └── support.test.ts
└── routes/
    ├── root.test.ts
    ├── example.test.ts
    └── todos.test.ts
```

## File Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| Command | `{action}-{resource}.command.ts` | `create-todo.command.ts` |
| Query | `get-{description}.query.ts` | `get-all-todos.query.ts` |
| Schema | `{resource}.schema.ts` | `todo.schema.ts` |
| Validator | `{resource}.validator.ts` | `todo.validator.ts` |
| Repository | `{resource}.repository.ts` | `todo.repository.ts` |
| Route | `index.ts` | `routes/api/v1/todos/index.ts` |
| Plugin | `{name}.ts` | `logger.ts` |
| Test | `{name}.test.ts` | `todos.test.ts` |
