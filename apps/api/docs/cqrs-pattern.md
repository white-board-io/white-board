---
title: CQRS Pattern
description: Command Query Responsibility Segregation implementation
category: architecture
---

# CQRS Pattern

This project implements the CQRS (Command Query Responsibility Segregation) pattern to separate read and write operations.

## Overview

| Type | Purpose | Examples |
|------|---------|----------|
| **Commands** | Modify state (write operations) | Create, Update, Delete |
| **Queries** | Read state (read operations) | Get by ID, List all |

## Directory Structure

```
modules/{resource}/
├── commands/
│   ├── create-{resource}.command.ts
│   ├── update-{resource}.command.ts
│   ├── delete-{resource}.command.ts
│   └── {action}-{resource}.command.ts    # Custom actions
└── queries/
    ├── get-all-{resources}.query.ts
    └── get-{resource}-by-id.query.ts
```

## Command Structure

Commands handle write operations that change application state.

### Command File Template

File: `src/modules/{resource}/commands/{action}-{resource}.command.ts`

```typescript
import { {InputSchema}, type {InputType}, type {EntityType} } from "../schemas/{resource}.schema";
import { {resource}Repository } from "../repository/{resource}.repository";
import { createValidationError } from "../../../shared/errors/app-error";
import type { LoggerHelpers } from "../../../plugins/logger";

export type {Action}{Resource}CommandResult = {
  data: {EntityType};
};

export async function {action}{Resource}Handler(
  input: unknown,
  logger: LoggerHelpers
): Promise<{Action}{Resource}CommandResult> {
  logger.debug("{Action}{Resource}Command received", { input });

  const parseResult = {InputSchema}.safeParse(input);
  if (!parseResult.success) {
    const errors = parseResult.error.flatten();
    logger.warn("Validation failed for {Action}{Resource}Command", { errors });
    throw createValidationError({ fieldErrors: errors.fieldErrors });
  }

  const validatedInput: {InputType} = parseResult.data;

  // Execute business logic
  const result = await {resource}Repository.{action}(validatedInput);

  logger.info("{Resource} {action}d successfully", { {resource}Id: result.id });

  return { data: result };
}
```

### Real Example: Create Todo Command

```typescript
import { CreateTodoInputSchema, type CreateTodoInput, type Todo } from "../schemas/todo.schema";
import { todoRepository } from "../repository/todo.repository";
import { todoValidator } from "../validators/todo.validator";
import { createValidationError } from "../../../shared/errors/app-error";
import type { LoggerHelpers } from "../../../plugins/logger";

export type CreateTodoCommandResult = {
  data: Todo;
};

export async function createTodoHandler(
  input: unknown,
  logger: LoggerHelpers
): Promise<CreateTodoCommandResult> {
  logger.debug("CreateTodoCommand received", { input });

  const parseResult = CreateTodoInputSchema.safeParse(input);
  if (!parseResult.success) {
    const errors = parseResult.error.flatten();
    logger.warn("Validation failed for CreateTodoCommand", { errors });
    throw createValidationError({ fieldErrors: errors.fieldErrors });
  }

  const validatedInput: CreateTodoInput = parseResult.data;

  await todoValidator.validateTitleUniqueness(validatedInput.title);

  const todo = await todoRepository.create(validatedInput);

  logger.info("Todo created successfully", { todoId: todo.id, title: todo.title });

  return { data: todo };
}
```

## Query Structure

Queries handle read operations that retrieve data without modifying state.

### Query File Template

File: `src/modules/{resource}/queries/get-{description}.query.ts`

```typescript
import type { {EntityType} } from "../schemas/{resource}.schema";
import { {resource}Repository } from "../repository/{resource}.repository";
import type { LoggerHelpers } from "../../../plugins/logger";

export type Get{Description}QueryResult = {
  data: {EntityType} | {EntityType}[];
};

export async function get{Description}Handler(
  params: unknown,
  logger: LoggerHelpers
): Promise<Get{Description}QueryResult> {
  logger.debug("Get{Description}Query received", { params });

  // Validate params if needed
  // Fetch data
  const result = await {resource}Repository.{method}(params);

  logger.info("{Resource} retrieved", { count: result.length });

  return { data: result };
}
```

### Real Example: Get All Todos Query

```typescript
import type { Todo } from "../schemas/todo.schema";
import { ListTodosQuerySchema } from "../schemas/todo.schema";
import { todoRepository } from "../repository/todo.repository";
import type { LoggerHelpers } from "../../../plugins/logger";

export type GetAllTodosQueryResult = {
  data: Todo[];
};

export async function getAllTodosHandler(
  queryParams: unknown,
  logger: LoggerHelpers
): Promise<GetAllTodosQueryResult> {
  logger.debug("GetAllTodosQuery received", { queryParams });

  const parseResult = ListTodosQuerySchema.safeParse(queryParams ?? {});
  const filters = parseResult.success
    ? parseResult.data
    : { completed: undefined, priority: undefined };

  const todos = await todoRepository.findAll({
    completed: filters.completed,
    priority: filters.priority,
  });

  logger.info("Todos retrieved", { count: todos.length, filters });

  return { data: todos };
}
```

## Handler Requirements

### Input Parameters

- Accept `unknown` type for raw input
- Validate inside the handler using Zod schemas
- Never trust input from routes

### Logger Parameter

- Always accept `LoggerHelpers` as a parameter
- Log at appropriate levels:
  - `debug`: Entry point, raw data
  - `info`: Successful operations
  - `warn`: Validation failures, not found
  - `error`: Unexpected errors

### Return Type

- Define explicit result types
- Wrap data in a consistent structure: `{ data: T }`
- Never return raw entities

### Error Handling

- Use factory functions from `shared/errors/app-error.ts`
- Throw `AppError` instances, not plain errors
- Let route error handler process the errors

## Command Types

| Action | File Pattern | HTTP Method |
|--------|--------------|-------------|
| Create | `create-{resource}.command.ts` | POST |
| Update | `update-{resource}.command.ts` | PUT |
| Delete | `delete-{resource}.command.ts` | DELETE |
| Toggle | `toggle-{resource}.command.ts` | PATCH |
| Custom | `{action}-{resource}.command.ts` | PATCH/POST |

## Query Types

| Operation | File Pattern | HTTP Method |
|-----------|--------------|-------------|
| List all | `get-all-{resources}.query.ts` | GET |
| Get by ID | `get-{resource}-by-id.query.ts` | GET /:id |
| Search | `search-{resources}.query.ts` | GET with query |
| Custom | `get-{description}.query.ts` | GET |
