---
title: Coding Conventions
description: TypeScript and code style guidelines for the API project
category: guidelines
---

# Coding Conventions

This document outlines the coding standards and conventions for the API project.

## TypeScript Guidelines

### Use `type` Instead of `interface`

Always use `type` for type definitions, never `interface`:

```typescript
// ✅ Good - use type
export type Todo = {
  id: string;
  title: string;
  completed: boolean;
};

export type CreateTodoInput = {
  title: string;
  description?: string;
};

// ❌ Bad - don't use interface
export interface Todo {
  id: string;
  title: string;
}
```

When deriving types from Zod schemas:

```typescript
// ✅ Good
export type Todo = z.infer<typeof TodoSchema>;

// ❌ Bad
export interface Todo extends z.infer<typeof TodoSchema> {}
```

### Use `type` Imports

Import types using the `type` keyword:

```typescript
// ✅ Good
import type { Todo, CreateTodoInput } from "../schemas/todo.schema";
import type { LoggerHelpers } from "../../../plugins/logger";

// ❌ Bad
import { Todo, CreateTodoInput } from "../schemas/todo.schema";
```

### Export Types Alongside Schemas

Always export both the schema and its inferred type:

```typescript
export const TodoSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
});

export type Todo = z.infer<typeof TodoSchema>;
```

## No JSDoc Comments

Do not add JSDoc comments to route handlers or endpoint methods:

```typescript
// ✅ Good - no JSDoc
fastify.post("/", async (request, reply) => {
  try {
    const result = await createTodoHandler(request.body, fastify.logger);
    return reply.status(201).send(result);
  } catch (error) {
    return handleError(error, reply);
  }
});

// ❌ Bad - avoid JSDoc on route handlers
/**
 * Create a new todo
 * @param request - The Fastify request
 * @param reply - The Fastify reply
 * @returns The created todo
 */
fastify.post("/", async (request, reply) => {
  // ...
});
```

JSDoc is acceptable for shared utilities and complex internal functions if absolutely needed, but prefer self-documenting code with clear naming.

## File Naming

### Use Kebab-Case

All file names use kebab-case with descriptive suffixes:

```
create-todo.command.ts      # Command handler
get-all-todos.query.ts      # Query handler
todo.schema.ts              # Zod schemas
todo.validator.ts           # Business validators
todo.repository.ts          # Data access
error-handler.ts            # Utilities
```

### File Suffix Patterns

| Type | Suffix | Example |
|------|--------|---------|
| Command | `.command.ts` | `create-todo.command.ts` |
| Query | `.query.ts` | `get-all-todos.query.ts` |
| Schema | `.schema.ts` | `todo.schema.ts` |
| Validator | `.validator.ts` | `todo.validator.ts` |
| Repository | `.repository.ts` | `todo.repository.ts` |
| Test | `.test.ts` | `todos.test.ts` |

## Function Naming

### Handler Functions

Use descriptive names with `Handler` suffix:

```typescript
// Commands
export async function createTodoHandler(...) {}
export async function updateTodoHandler(...) {}
export async function deleteTodoHandler(...) {}
export async function toggleTodoHandler(...) {}

// Queries
export async function getAllTodosHandler(...) {}
export async function getTodoByIdHandler(...) {}
```

### Factory Functions

Prefix with `create`:

```typescript
export const createValidationError = (details?: Record<string, unknown>) => ...
export const createNotFoundError = (resource: string, id?: string) => ...
export const createErrorHandler = (fastify: FastifyInstance) => ...
```

## Handler Patterns

### Accept Unknown Input

Handlers accept `unknown` type for input, validating inside:

```typescript
// ✅ Good - accept unknown, validate inside
export async function createTodoHandler(
  input: unknown,
  logger: LoggerHelpers
): Promise<CreateTodoCommandResult> {
  const parseResult = CreateTodoInputSchema.safeParse(input);
  // ...
}

// ❌ Bad - typed input (validation happens elsewhere)
export async function createTodoHandler(
  input: CreateTodoInput,
  logger: LoggerHelpers
): Promise<CreateTodoCommandResult> {
  // No validation - trust the input
}
```

### Explicit Return Types

Always define explicit return types for handlers:

```typescript
export type CreateTodoCommandResult = {
  data: Todo;
};

export async function createTodoHandler(
  input: unknown,
  logger: LoggerHelpers
): Promise<CreateTodoCommandResult> {
  // ...
  return { data: todo };
}
```

### Consistent Result Structure

Wrap returned data in a `data` property:

```typescript
// ✅ Good - wrapped in data
return { data: todo };
return { data: todos };

// ❌ Bad - raw entity
return todo;
return todos;
```

## Route Patterns

### Route Handler Structure

Every route follows this pattern:

```typescript
fastify.{method}("/{path}", async (request, reply) => {
  try {
    const result = await {handler}({params}, fastify.logger);
    return reply.status({statusCode}).send(result);
  } catch (error) {
    return handleError(error, reply);
  }
});
```

### No Inline Logic

Keep route handlers thin - delegate to command/query handlers:

```typescript
// ✅ Good - delegate to handler
fastify.post("/", async (request, reply) => {
  try {
    const result = await createTodoHandler(request.body, fastify.logger);
    return reply.status(201).send(result);
  } catch (error) {
    return handleError(error, reply);
  }
});

// ❌ Bad - inline business logic
fastify.post("/", async (request, reply) => {
  const parseResult = CreateTodoInputSchema.safeParse(request.body);
  if (!parseResult.success) {
    return reply.status(400).send({ error: parseResult.error });
  }
  const todo = await todoRepository.create(parseResult.data);
  return reply.status(201).send({ data: todo });
});
```

## Import Order

Organize imports in this order:

1. External packages
2. Schemas/types (with `type` keyword)
3. Repository
4. Validators
5. Shared utilities
6. Types from plugins

```typescript
import { z } from "zod";

import { CreateTodoInputSchema, type CreateTodoInput, type Todo } from "../schemas/todo.schema";
import { todoRepository } from "../repository/todo.repository";
import { todoValidator } from "../validators/todo.validator";
import { createValidationError } from "../../../shared/errors/app-error";
import type { LoggerHelpers } from "../../../plugins/logger";
```

## Error Handling

### Use Factory Functions

Never create `AppError` directly in handlers:

```typescript
// ✅ Good - use factory
throw createValidationError({ fieldErrors: errors.fieldErrors });
throw createNotFoundError("Todo", id);

// ❌ Bad - direct instantiation
throw new AppError("VALIDATION_ERROR", undefined, { fieldErrors });
```

### Log Before Throwing

Always log warnings before throwing expected errors:

```typescript
logger.warn("Todo not found", { id: validatedId });
throw createNotFoundError("Todo", validatedId);
```

## Repository Pattern

### Object Export

Export repository as a constant object:

```typescript
export const todoRepository = {
  findAll: async (filters?: { completed?: boolean }) => { ... },
  findById: async (id: string) => { ... },
  create: async (input: CreateTodoInput) => { ... },
  update: async (id: string, input: UpdateTodoInput) => { ... },
  delete: async (id: string) => { ... },
};
```

### Async Methods

All repository methods are async (ready for database):

```typescript
// ✅ Good - async
findById: async (id: string): Promise<Todo | undefined> => {
  return todoStore.get(id);
}

// ❌ Bad - sync
findById: (id: string): Todo | undefined => {
  return todoStore.get(id);
}
```

## Validation Order

In handlers, validate in this order:

1. ID/param validation
2. Check resource exists
3. Body validation
4. Business rule validation

```typescript
export async function updateTodoHandler(id: unknown, input: unknown, logger: LoggerHelpers) {
  // 1. Validate ID
  const idParseResult = TodoIdParamSchema.safeParse({ id });
  if (!idParseResult.success) {
    throw createValidationError({ fieldErrors: idParseResult.error.flatten().fieldErrors });
  }

  // 2. Check exists
  const existing = await todoRepository.findById(idParseResult.data.id);
  if (!existing) {
    throw createNotFoundError("Todo", idParseResult.data.id);
  }

  // 3. Validate body
  const parseResult = UpdateTodoInputSchema.safeParse(input);
  if (!parseResult.success) {
    throw createValidationError({ fieldErrors: parseResult.error.flatten().fieldErrors });
  }

  // 4. Business rules
  if (parseResult.data.title) {
    await todoValidator.validateTitleUniqueness(parseResult.data.title, idParseResult.data.id);
  }

  // Execute update
  const updated = await todoRepository.update(idParseResult.data.id, parseResult.data);
  return { data: updated };
}
```

## Quick Reference

| Guideline | Do | Don't |
|-----------|----|----|
| Type definitions | `type Todo = {...}` | `interface Todo {...}` |
| Type imports | `import type { Todo }` | `import { Todo }` |
| Route comments | No JSDoc | JSDoc on every method |
| Handler input | `input: unknown` | `input: CreateTodoInput` |
| Return structure | `{ data: todo }` | `todo` |
| Error creation | `createNotFoundError()` | `new AppError()` |
| Repository methods | `async` functions | sync functions |
