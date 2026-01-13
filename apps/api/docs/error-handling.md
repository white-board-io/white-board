---
title: Error Handling
description: i18n-ready error responses with error codes and format arguments
category: architecture
---

# Error Handling

This project uses a structured error handling approach with i18n support. Errors return codes and format arguments that clients can use to display localized messages.

## Error Response Format

All errors follow this structure:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "formatArgs": { "key": "value" },
    "details": { "additional": "info" }
  }
}
```

| Field        | Required | Purpose                                       |
| ------------ | -------- | --------------------------------------------- |
| `code`       | Yes      | Error code for i18n lookup                    |
| `formatArgs` | No       | Values to interpolate into translated message |
| `details`    | No       | Additional structured error information       |

## Error Codes

Available error codes defined in `src/shared/errors/app-error.ts`:

| Code                 | HTTP Status | Description                            |
| -------------------- | ----------- | -------------------------------------- |
| `VALIDATION_ERROR`   | 400         | Request validation failed              |
| `RESOURCE_NOT_FOUND` | 404         | Requested resource does not exist      |
| `DUPLICATE_RESOURCE` | 409         | Resource with same unique field exists |
| `INTERNAL_ERROR`     | 500         | Unexpected server error                |

### Adding New Error Codes

To add a new error code, update `src/shared/errors/app-error.ts`:

```typescript
export type ErrorCode =
  | "VALIDATION_ERROR"
  | "RESOURCE_NOT_FOUND"
  | "DUPLICATE_RESOURCE"
  | "INTERNAL_ERROR"
  | "UNAUTHORIZED" // Add new code
  | "FORBIDDEN"; // Add new code
```

Then update the status code mapping:

```typescript
private getStatusCode(code: ErrorCode): number {
  const statusMap: Record<ErrorCode, number> = {
    VALIDATION_ERROR: 400,
    RESOURCE_NOT_FOUND: 404,
    DUPLICATE_RESOURCE: 409,
    INTERNAL_ERROR: 500,
    UNAUTHORIZED: 401,    // Add mapping
    FORBIDDEN: 403,       // Add mapping
  };
  return statusMap[code];
}
```

## AppError Class

Located at `src/shared/errors/app-error.ts`:

```typescript
export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly formatArgs?: Record<string, string | number>;
  public readonly details?: Record<string, unknown>;

  constructor(
    code: ErrorCode,
    formatArgs?: Record<string, string | number>,
    details?: Record<string, unknown>
  ) {
    super(code);
    this.name = "AppError";
    this.code = code;
    this.formatArgs = formatArgs;
    this.details = details;
    this.statusCode = this.getStatusCode(code);
  }

  toJSON(): AppErrorResponse {
    return {
      code: this.code,
      ...(this.formatArgs && { formatArgs: this.formatArgs }),
      ...(this.details && { details: this.details }),
    };
  }
}
```

## Factory Functions

Use factory functions to create consistent errors:

### createValidationError

For schema validation failures with i18n error codes:

```typescript
import { z } from "zod";
import { createValidationError } from "../../../shared/errors/app-error";

const parseResult = Schema.safeParse(input);
if (!parseResult.success) {
  // Use z.flattenError() for Zod v4 (error.flatten() is deprecated)
  const errors = z.flattenError(parseResult.error);
  throw createValidationError({ fieldErrors: errors.fieldErrors });
}
```

Response (with i18n error codes from schema):

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "details": {
      "fieldErrors": {
        "title": ["TITLE_FIELD_REQUIRED"]
      }
    }
  }
}
```

> **Note**: Field-level error codes like `TITLE_FIELD_REQUIRED` come from the Zod schema definitions. See [Schemas & Validation](./schemas-validation.md#i18n-error-codes) for details.

### createNotFoundError

For missing resources:

```typescript
import { createNotFoundError } from "../../../shared/errors/app-error";

const todo = await todoRepository.findById(id);
if (!todo) {
  throw createNotFoundError("Todo", id);
}
```

Response:

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "formatArgs": {
      "resource": "Todo",
      "id": "abc-123"
    }
  }
}
```

### createDuplicateError

For unique constraint violations:

```typescript
import { createDuplicateError } from "../../../shared/errors/app-error";

const existing = await todoRepository.findByTitle(title);
if (existing) {
  throw createDuplicateError("Todo", "title", title);
}
```

Response:

```json
{
  "error": {
    "code": "DUPLICATE_RESOURCE",
    "formatArgs": {
      "resource": "Todo",
      "field": "title",
      "value": "My Todo"
    }
  }
}
```

### createInternalError

For unexpected errors:

```typescript
import { createInternalError } from "../../../shared/errors/app-error";

throw createInternalError();
```

Response:

```json
{
  "error": {
    "code": "INTERNAL_ERROR"
  }
}
```

## Adding New Factory Functions

To add a new factory function:

```typescript
export const createUnauthorizedError = (reason?: string) =>
  new AppError("UNAUTHORIZED", reason ? { reason } : undefined);

export const createForbiddenError = (resource: string, action: string) =>
  new AppError("FORBIDDEN", { resource, action });
```

## Error Handler

Routes use `createErrorHandler` from `src/shared/utils/error-handler.ts`:

```typescript
import { createErrorHandler } from "../../../../shared/utils/error-handler";

const notesRoutes: FastifyPluginAsync = async (fastify): Promise<void> => {
  const handleError = createErrorHandler(fastify);

  fastify.post("/", async (request, reply) => {
    try {
      const result = await createNoteHandler(request.body, fastify.logger);
      return reply.status(201).send(result);
    } catch (error) {
      return handleError(error, reply);
    }
  });
};
```

The error handler:

1. Checks if error is `AppError` instance
2. Returns structured response with correct status code
3. Logs unexpected errors as `INTERNAL_ERROR`

## i18n Client Usage

Clients use the error response to display localized messages.

### Top-Level Error Codes

For `code` field in the error response:

```typescript
// Client-side example
const translations = {
  RESOURCE_NOT_FOUND: "{resource} with ID {id} not found",
  DUPLICATE_RESOURCE: "{resource} with {field} '{value}' already exists",
  VALIDATION_ERROR: "Please check your input",
  INTERNAL_ERROR: "An unexpected error occurred",
};

function getErrorMessage(error: ErrorResponse): string {
  const template = translations[error.code];
  if (!error.formatArgs) return template;

  return Object.entries(error.formatArgs).reduce(
    (msg, [key, value]) => msg.replace(`{${key}}`, String(value)),
    template
  );
}

// Usage
// error = { code: "RESOURCE_NOT_FOUND", formatArgs: { resource: "Todo", id: "123" } }
// Result: "Todo with ID 123 not found"
```

### Field-Level Validation Error Codes

For `details.fieldErrors` in validation errors:

```typescript
// Field-level error code translations
const fieldErrorTranslations = {
  TITLE_FIELD_REQUIRED: "Title is required",
  TITLE_FIELD_MAX_LENGTH: "Title must be 200 characters or less",
  DESCRIPTION_FIELD_MAX_LENGTH: "Description must be 1000 characters or less",
  INVALID_TODO_ID_FORMAT: "Invalid todo ID format",
  INVALID_PRIORITY_VALUE: "Priority must be low, medium, or high",
  INVALID_DATE_FORMAT: "Invalid date format",
};

function getFieldErrors(error: ErrorResponse): Record<string, string[]> {
  if (error.code !== "VALIDATION_ERROR" || !error.details?.fieldErrors) {
    return {};
  }

  const result: Record<string, string[]> = {};
  for (const [field, codes] of Object.entries(error.details.fieldErrors)) {
    result[field] = codes.map((code) => fieldErrorTranslations[code] || code);
  }
  return result;
}

// Usage
// error.details.fieldErrors = { title: ["TITLE_FIELD_REQUIRED"] }
// Result: { title: ["Title is required"] }
```

## Best Practices

1. **Always use factory functions** - Don't create `AppError` directly in handlers
2. **Include meaningful formatArgs** - Help clients display useful messages
3. **Log before throwing** - Use logger.warn for expected errors
4. **Don't expose internal details** - Keep `details` for validation errors only
5. **Use appropriate error codes** - Match the semantic meaning of the error
