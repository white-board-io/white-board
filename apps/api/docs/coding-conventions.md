---
title: Coding Conventions
description: TypeScript and code style guidelines for the API project
category: guidelines
priority: high
---

# Coding Conventions

This document outlines the coding standards and conventions for the API project.

## No Comments Policy

**Do not add comments to code.** Write self-documenting code with clear, descriptive naming instead. Comments are redundant and add noise when code is properly named.

### Why No Comments

- Comments become outdated and misleading
- Good naming makes comments unnecessary
- Comments clutter the codebase
- Type definitions already document data shapes

### Instead of Comments, Use

| Bad (with comments) | Good (self-documenting) |
|---------------------|------------------------|
| `const t = 3600; // seconds` | `const tokenExpiresInSeconds = 3600;` |
| `// Get user by ID` | `getUserById(id)` |
| `// Check if valid` | `isValidEmail(email)` |
| `// Admin can delete` | `canAdminDeleteResource(user)` |

### Examples

```typescript
// Bad
// Create a new todo item and save to database
export async function create(input: unknown) {
  // Validate the input first
  const result = schema.safeParse(input);
  // ...
}

// Good
export async function createTodoHandler(input: unknown) {
  const validationResult = CreateTodoInputSchema.safeParse(input);
  // ...
}
```

```typescript
// Bad
const d = new Date(); // current date
const e = 3600; // expiry time

// Good
const currentDate = new Date();
const sessionExpiryInSeconds = 3600;
```

### Acceptable Exceptions

Comments are acceptable only for:

- TODO markers for future work: `// TODO: implement caching`
- Complex regex explanations (if truly unavoidable)
- Legal/license headers (if required)

## TypeScript Guidelines

### Use `type` Instead of `interface`

Always use `type` for type definitions, never `interface`:

```typescript
// Good
export type Todo = {
  id: string;
  title: string;
  completed: boolean;
};

// Bad
export interface Todo {
  id: string;
  title: string;
}
```

When deriving types from Zod schemas:

```typescript
// Good
export type Todo = z.infer<typeof TodoSchema>;

// Bad
export interface Todo extends z.infer<typeof TodoSchema> {}
```

### Use `type` Imports

Import types using the `type` keyword:

```typescript
// Good
import type { Todo, CreateTodoInput } from "../schemas/todo.schema";
import type { LoggerHelpers } from "../../../plugins/logger";

// Bad
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

## Naming Conventions

### File Naming (kebab-case with suffix)

| Type | Suffix | Example |
|------|--------|---------|
| Command | `.command.ts` | `create-todo.command.ts` |
| Query | `.query.ts` | `get-all-todos.query.ts` |
| Schema | `.schema.ts` | `todo.schema.ts` |
| Validator | `.validator.ts` | `todo.validator.ts` |
| Repository | `.repository.ts` | `todo.repository.ts` |
| Test | `.test.ts` | `todos.test.ts` |

### Function Naming

Handler functions use descriptive names with `Handler` suffix:

```typescript
// Commands
export async function createTodoHandler(...) {}
export async function updateTodoHandler(...) {}
export async function deleteTodoHandler(...) {}

// Queries
export async function getAllTodosHandler(...) {}
export async function getTodoByIdHandler(...) {}
```

Factory functions prefix with `create`:

```typescript
export const createValidationError = (details?: Record<string, unknown>) => ...
export const createNotFoundError = (resource: string, id?: string) => ...
export const createErrorHandler = (fastify: FastifyInstance) => ...
```

### Variable Naming

Use descriptive names that explain purpose:

```typescript
// Good
const userEmailAddress = request.body.email;
const isOrganizationOwner = member.role === "owner";
const passwordResetTokenExpiresAt = new Date(Date.now() + 3600000);

// Bad
const e = request.body.email;
const isOwner = member.role === "owner"; // ambiguous - owner of what?
const exp = new Date(Date.now() + 3600000);
```

## Handler Patterns

### Accept Unknown Input

Handlers accept `unknown` type for input, validating inside:

```typescript
// Good
export async function createTodoHandler(
  input: unknown,
  logger: LoggerHelpers
): Promise<CreateTodoCommandResult> {
  const parseResult = CreateTodoInputSchema.safeParse(input);
  // ...
}

// Bad
export async function createTodoHandler(
  input: CreateTodoInput,
  logger: LoggerHelpers
): Promise<CreateTodoCommandResult> {
  // No validation - trusts input blindly
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
// Good
return { data: todo };
return { data: todos };

// Bad
return todo;
return todos;
```

## Route Patterns

### Route Handler Structure

Every route follows this pattern:

```typescript
fastify.post("/", async (request, reply) => {
  try {
    const result = await createTodoHandler(request.body, fastify.logger);
    return reply.status(201).send(result);
  } catch (error) {
    return handleError(error, reply);
  }
});
```

### No Inline Logic

Keep route handlers thin - delegate to command/query handlers:

```typescript
// Good
fastify.post("/", async (request, reply) => {
  try {
    const result = await createTodoHandler(request.body, fastify.logger);
    return reply.status(201).send(result);
  } catch (error) {
    return handleError(error, reply);
  }
});

// Bad
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
// Good
throw createValidationError({ fieldErrors: errors.fieldErrors });
throw createNotFoundError("Todo", id);

// Bad
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

All repository methods are async:

```typescript
// Good
findById: async (id: string): Promise<Todo | undefined> => {
  return todoStore.get(id);
}

// Bad
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
  const idParseResult = TodoIdParamSchema.safeParse({ id });
  if (!idParseResult.success) {
    throw createValidationError({ fieldErrors: idParseResult.error.flatten().fieldErrors });
  }

  const existingTodo = await todoRepository.findById(idParseResult.data.id);
  if (!existingTodo) {
    throw createNotFoundError("Todo", idParseResult.data.id);
  }

  const bodyParseResult = UpdateTodoInputSchema.safeParse(input);
  if (!bodyParseResult.success) {
    throw createValidationError({ fieldErrors: bodyParseResult.error.flatten().fieldErrors });
  }

  if (bodyParseResult.data.title) {
    await todoValidator.validateTitleUniqueness(bodyParseResult.data.title, idParseResult.data.id);
  }

  const updatedTodo = await todoRepository.update(idParseResult.data.id, bodyParseResult.data);
  return { data: updatedTodo };
}
```

## Quick Reference

| Guideline | Do | Don't |
|-----------|----|----|
| Comments | No comments, use good names | Comments explaining code |
| Type definitions | `type Todo = {...}` | `interface Todo {...}` |
| Type imports | `import type { Todo }` | `import { Todo }` |
| Handler input | `input: unknown` | `input: CreateTodoInput` |
| Return structure | `{ data: todo }` | `todo` |
| Error creation | `createNotFoundError()` | `new AppError()` |
| Repository methods | `async` functions | sync functions |
| Variable names | `userEmailAddress` | `email` or `e` |
