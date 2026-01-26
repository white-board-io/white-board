---
title: Error Handling
description: i18n-ready error responses with error codes and format arguments
category: architecture
---

# Error Handling

This project uses a **Result Pattern** for business logic and validation errors. instead of throwing exceptions, handlers return a `ServiceResult` object that indicates success or failure.

Exceptions (`throw`) are reserved for unexpected system errors (bugs, crashes, database connection failures) and are handled by a global error handler.

## ServiceResult Pattern

All command and query handlers return a `ServiceResult<T>`:

```typescript
export type ServiceResult<T> =
  | { isSuccess: true; data: T }
  | { isSuccess: false; errors: ServiceError[] };

export type ServiceError = {
  code: string;
  message: string;
  value?: string;
};
```

## Error Response Format

When a handler fails, the API responds with the list of errors:

```json
[
  {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Todo with ID 123 not found",
    "value": "123"
  }
]
```

Or if the API wraps it (depending on your route handler implementation):

```json
{
  "error": {
     "code": "VALIDATION_ERROR",
     "details": [...]
  }
}
```

_Note: Ensure your route handlers transform `result.errors` into the expected JSON response if strict schema validation is enabled._

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

````typescript
export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly formatArgs?: Record<string, string | number>;
  public readonly details?: Record<string, unknown>;

  constructor(
    code: ErrorCode,
    formatArgs?: Record<string, string | number>,
    details?: Record<string, unknown>,
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

## Returning Failures

 Instead of throwing errors, return a failure object:

 ### Validation Errors

 ```typescript
 import { z } from "zod";

 const parseResult = Schema.safeParse(input);
 if (!parseResult.success) {
   const errors = parseResult.error.flatten();
   return {
     isSuccess: false,
     errors: Object.entries(errors.fieldErrors).map(([field, messages]) => ({
       code: "VALIDATION_ERROR",
       message: messages?.[0] || "Invalid value",
       value: field // or specific value if needed
     }))
   };
 }
````

### Resource Not Found

```typescript
const todo = await todoRepository.findById(id);
if (!todo) {
  return {
    isSuccess: false,
    errors: [
      {
        code: "RESOURCE_NOT_FOUND",
        message: `Todo with ID ${id} not found`,
        value: id,
      },
    ],
  };
}
```

### Business Logic Errors

```typescript
if (existingItem) {
  return {
    isSuccess: false,
    errors: [
      {
        code: "DUPLICATE_RESOURCE",
        message: `Item with title "${title}" already exists`,
        value: title,
      },
    ],
  };
}
```

## Error Handler

## Handling Results in Routes

Route handlers act as the adapter between the HTTP layer and the service layer. They must check the result status:

```typescript
import { createErrorHandler } from "../../../../shared/utils/error-handler";

const notesRoutes: FastifyPluginAsync = async (fastify): Promise<void> => {
  const handleError = createErrorHandler(fastify);

  fastify.post("/", async (request, reply) => {
    try {
      const result = await createNoteHandler(request.body, fastify.logger);

      if (result.isSuccess) {
        return reply.status(201).send(result.data);
      }

      // Handle known failures
      return reply.status(400).send(result.errors);
    } catch (error) {
      // Handle unexpected crashes
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
    template,
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
