---
title: API Project
description: Fastify-based REST API following CQRS pattern with file-based routing
version: 1.0.0
framework: Fastify 5.x
language: TypeScript
---

# API

A production-ready REST API built with Fastify and TypeScript, following CQRS (Command Query Responsibility Segregation) pattern with file-based routing.

## Quick Start

```bash
# Development mode
npm run dev

# Production mode
npm run start

# Run tests
npm run test

# Lint
npm run lint
```

The API runs on [http://localhost:8000](http://localhost:8000).

## Documentation

- [Folder Structure](./docs/folder-structure.md) - Project organization and file locations
- [Creating Endpoints](./docs/creating-endpoints.md) - Step-by-step guide for adding new API endpoints
- [CQRS Pattern](./docs/cqrs-pattern.md) - Commands and Queries implementation
- [Error Handling](./docs/error-handling.md) - i18n-ready error responses with error codes
- [Schemas & Validation](./docs/schemas-validation.md) - Zod schemas and validation patterns
- [Logging](./docs/logging.md) - Structured logging with Pino
- [Coding Conventions](./docs/coding-conventions.md) - TypeScript and code style guidelines

## Tech Stack

| Technology | Purpose |
|------------|---------|
| Fastify 5.x | Web framework |
| TypeScript | Type safety |
| Zod | Schema validation |
| Pino | Logging |
| @fastify/autoload | File-based routing |

## Project Structure Overview

```
src/
├── app.ts                    # Application entry point
├── modules/                  # Feature modules (CQRS)
│   └── {module}/
│       ├── commands/         # Write operations
│       ├── queries/          # Read operations
│       ├── schemas/          # Zod schemas & types
│       ├── validators/       # Business validation
│       └── repository/       # Data access layer
├── routes/                   # File-based routing
│   └── api/v1/{resource}/    # Route handlers
├── plugins/                  # Fastify plugins
└── shared/                   # Shared utilities
    ├── errors/               # Error classes & factories
    └── utils/                # Helper functions
```

## Key Patterns

### File-Based Routing

Routes are automatically loaded based on directory structure:

```
routes/api/v1/todos/index.ts → /api/v1/todos
routes/api/v1/users/index.ts → /api/v1/users
```

### CQRS Separation

- **Commands**: `create-{resource}.command.ts`, `update-{resource}.command.ts`, `delete-{resource}.command.ts`
- **Queries**: `get-all-{resources}.query.ts`, `get-{resource}-by-id.query.ts`

### i18n-Ready Error Responses

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "formatArgs": { "resource": "Todo", "id": "abc-123" }
  }
}
```

Clients use the `code` and `formatArgs` to display localized messages.

## Example Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/v1/todos | Create a todo |
| GET | /api/v1/todos | List all todos |
| GET | /api/v1/todos/:id | Get a todo by ID |
| PUT | /api/v1/todos/:id | Update a todo |
| DELETE | /api/v1/todos/:id | Delete a todo |
| PATCH | /api/v1/todos/:id/toggle | Toggle todo status |

## License

ISC
