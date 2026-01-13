---
title: Logging
description: Structured logging with Pino via Fastify
category: architecture
---

# Logging

This project uses Pino (via Fastify) for structured JSON logging. A custom logger plugin provides helper methods for consistent logging across handlers.

## Logger Plugin

Located at `src/plugins/logger.ts`, the plugin provides a simplified interface:

```typescript
export type LoggerHelpers = {
  info: (msg: string, data?: Record<string, unknown>) => void;
  warn: (msg: string, data?: Record<string, unknown>) => void;
  error: (msg: string, error?: Error | Record<string, unknown>) => void;
  debug: (msg: string, data?: Record<string, unknown>) => void;
};
```

## Log Levels

| Level | Purpose | Example |
|-------|---------|---------|
| `debug` | Detailed debugging info | Handler entry, raw input data |
| `info` | Normal operations | Successful create/update/delete |
| `warn` | Expected issues | Validation failures, not found |
| `error` | Unexpected errors | Unhandled exceptions |

## Usage in Handlers

Every handler receives a `logger` parameter:

```typescript
export async function createTodoHandler(
  input: unknown,
  logger: LoggerHelpers
): Promise<CreateTodoCommandResult> {
  // Debug: Entry point
  logger.debug("CreateTodoCommand received", { input });

  const parseResult = CreateTodoInputSchema.safeParse(input);
  if (!parseResult.success) {
    // Warn: Expected validation failure
    logger.warn("Validation failed for CreateTodoCommand", { 
      errors: parseResult.error.flatten() 
    });
    throw createValidationError({ fieldErrors: parseResult.error.flatten().fieldErrors });
  }

  const todo = await todoRepository.create(parseResult.data);

  // Info: Successful operation
  logger.info("Todo created successfully", { 
    todoId: todo.id, 
    title: todo.title 
  });

  return { data: todo };
}
```

## Log Methods

### debug

For detailed debugging information. Use for:
- Handler entry points
- Raw input data
- Internal state

```typescript
logger.debug("GetTodoByIdQuery received", { id });
logger.debug("Todo retrieved", { todoId: validatedId });
```

### info

For successful operations. Use for:
- Resource creation/update/deletion
- Completed queries
- State changes

```typescript
logger.info("Todo created successfully", { todoId: todo.id, title: todo.title });
logger.info("Todos retrieved", { count: todos.length, filters });
logger.info("Todo status toggled", { todoId, completed: newStatus });
```

### warn

For expected issues that aren't errors. Use for:
- Validation failures
- Resource not found
- Business rule violations

```typescript
logger.warn("Validation failed for CreateTodoCommand", { errors });
logger.warn("Todo not found", { id: validatedId });
logger.warn("Invalid todo ID format", { id, errors });
```

### error

For unexpected errors. Use for:
- Unhandled exceptions
- Database failures
- External service errors

```typescript
logger.error("Unexpected error", error);
logger.error("Database connection failed", { connectionString: "***" });
```

## Structured Data

Always log structured data as the second parameter:

```typescript
// Good - structured data
logger.info("Todo created", { todoId: todo.id, title: todo.title });

// Bad - data in message string
logger.info(`Todo created: ${todo.id}`);
```

### Common Log Fields

| Field | Description |
|-------|-------------|
| `todoId` | Resource identifier |
| `title` | Human-readable identifier |
| `count` | Number of items |
| `filters` | Applied query filters |
| `errors` | Validation error details |
| `input` | Raw input (debug only) |

## Log Output

In development, logs are formatted with `pino-pretty`:

```
[12:34:56] INFO: Todo created successfully
    todoId: "abc-123"
    title: "My Todo"
```

In production, logs are JSON:

```json
{
  "level": 30,
  "time": 1704067200000,
  "msg": "Todo created successfully",
  "todoId": "abc-123",
  "title": "My Todo"
}
```

## Usage in Routes

Access the logger via `fastify.logger`:

```typescript
const todosRoutes: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.post("/", async (request, reply) => {
    try {
      const result = await createTodoHandler(request.body, fastify.logger);
      return reply.status(201).send(result);
    } catch (error) {
      return handleError(error, reply);
    }
  });
};
```

## Error Handler Logging

The error handler in `src/shared/utils/error-handler.ts` logs unexpected errors:

```typescript
export function createErrorHandler(fastify: FastifyInstance) {
  return (error: unknown, reply: FastifyReply) => {
    if (error instanceof AppError) {
      // AppErrors are already logged in handlers
      return reply.status(error.statusCode).send({ error: error.toJSON() });
    }

    // Log unexpected errors
    fastify.logger.error("Unexpected error", error as Error);
    return reply.status(500).send({ error: { code: "INTERNAL_ERROR" } });
  };
}
```

## Best Practices

1. **Log at handler entry** - Use `debug` when handler receives input
2. **Log successful operations** - Use `info` for completed actions
3. **Log expected failures** - Use `warn` for validation/not-found
4. **Include identifiers** - Always log resource IDs
5. **Use structured data** - Never interpolate data into message strings
6. **Avoid sensitive data** - Don't log passwords, tokens, or PII
7. **Be consistent** - Use the same field names across handlers
