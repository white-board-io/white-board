---
title: Schemas & Validation
description: Zod schemas for type definitions and runtime validation with i18n support
category: architecture
---

# Schemas & Validation

This project uses [Zod](https://zod.dev) for runtime schema validation and TypeScript type inference. All validation happens inside handlers, not in route definitions.

## i18n Error Codes

All Zod validation messages use **error codes** instead of human-readable strings for i18n (internationalization) support. Clients use these codes to display localized error messages.

### Defining Error Codes

Define validation error codes as a constant object in your schema file:

```typescript
import { z } from "zod";

/**
 * i18n Error Codes for Zod validation
 * These codes are used by clients to display localized error messages
 */
export const ValidationErrorCodes = {
  TITLE_FIELD_REQUIRED: "TITLE_FIELD_REQUIRED",
  TITLE_FIELD_MAX_LENGTH: "TITLE_FIELD_MAX_LENGTH",
  DESCRIPTION_FIELD_MAX_LENGTH: "DESCRIPTION_FIELD_MAX_LENGTH",
  INVALID_TODO_ID_FORMAT: "INVALID_TODO_ID_FORMAT",
  INVALID_PRIORITY_VALUE: "INVALID_PRIORITY_VALUE",
  INVALID_DATE_FORMAT: "INVALID_DATE_FORMAT",
} as const;
```

### Using Error Codes in Schemas

Pass error codes using the `{ message: ... }` syntax:

```typescript
export const TodoSchema = z.object({
  id: z.string().uuid({ message: ValidationErrorCodes.INVALID_TODO_ID_FORMAT }),
  title: z
    .string()
    .min(1, { message: ValidationErrorCodes.TITLE_FIELD_REQUIRED })
    .max(200, { message: ValidationErrorCodes.TITLE_FIELD_MAX_LENGTH }),
  description: z
    .string()
    .max(1000, { message: ValidationErrorCodes.DESCRIPTION_FIELD_MAX_LENGTH })
    .optional(),
  priority: PrioritySchema.default("medium"),
  dueDate: z.coerce
    .date({ message: ValidationErrorCodes.INVALID_DATE_FORMAT })
    .optional(),
  completed: z.boolean().default(false),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Todo = z.infer<typeof TodoSchema>;
```

### Create Input Schema

For POST requests - required fields for creation:

```typescript
export const CreateTodoInputSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  priority: z.enum(["low", "medium", "high"]).optional().default("medium"),
  dueDate: z.coerce.date().optional(),
});

export type CreateTodoInput = z.infer<typeof CreateTodoInputSchema>;
```

### Update Input Schema

For PUT/PATCH requests - all fields optional:

```typescript
export const UpdateTodoInputSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  dueDate: z.coerce.date().optional().nullable(),
  completed: z.boolean().optional(),
});

export type UpdateTodoInput = z.infer<typeof UpdateTodoInputSchema>;
```

### ID Param Schema

For URL parameters (with i18n error code):

```typescript
export const TodoIdParamSchema = z.object({
  id: z.string().uuid({ message: ValidationErrorCodes.INVALID_TODO_ID_FORMAT }),
});

export type TodoIdParam = z.infer<typeof TodoIdParamSchema>;
```

### Query Schema

For GET query parameters:

```typescript
export const ListTodosQuerySchema = z.object({
  completed: z
    .string()
    .optional()
    .transform((val) => {
      if (val === "true") return true;
      if (val === "false") return false;
      return undefined;
    }),
  priority: z.enum(["low", "medium", "high"]).optional(),
});

export type ListTodosQuery = z.infer<typeof ListTodosQuerySchema>;
```

## Schema Organization

Schemas are located in `src/modules/{resource}/schemas/{resource}.schema.ts`:

```
modules/todo/schemas/
└── todo.schema.ts
    ├── ValidationErrorCodes (i18n error codes)
    ├── Entity schemas (TodoSchema)
    ├── Input schemas (CreateTodoInputSchema, UpdateTodoInputSchema)
    ├── Param schemas (TodoIdParamSchema)
    └── Query schemas (ListTodosQuerySchema)
```

## Validation Pattern

All validation happens inside command/query handlers using `safeParse` and Zod v4's `z.flattenError()`:

```typescript
import { z } from "zod";
import {
  CreateTodoInputSchema,
  type CreateTodoInput,
} from "../schemas/todo.schema";
import { createValidationError } from "../../../shared/errors/app-error";

export async function createTodoHandler(
  input: unknown,
  logger: LoggerHelpers
): Promise<CreateTodoCommandResult> {
  logger.debug("CreateTodoCommand received", { input });

  const parseResult = CreateTodoInputSchema.safeParse(input);
  if (!parseResult.success) {
    // Use z.flattenError() instead of deprecated error.flatten()
    const errors = z.flattenError(parseResult.error);
    logger.warn("Validation failed for CreateTodoCommand", { errors });
    throw createValidationError({ fieldErrors: errors.fieldErrors });
  }

  const validatedInput: CreateTodoInput = parseResult.data;
  // ... continue with validated data
}
```

### Why Inside Handlers?

1. **Separation of concerns** - Routes handle HTTP, handlers handle validation
2. **Testability** - Handlers can be tested without HTTP layer
3. **Flexibility** - Same handler can be used from different sources
4. **Error consistency** - All errors go through the same error factory

## Common Zod Patterns

### String Validation

```typescript
z.string(); // Any string
z.string().min(1); // Required (non-empty)
z.string().max(200); // Maximum length
z.string().min(1).max(200); // Required with max
z.string().email(); // Email format
z.string().url(); // URL format
z.string().uuid(); // UUID format
z.string().regex(/^[A-Z]{3}$/); // Custom pattern
```

### Number Validation

```typescript
z.number(); // Any number
z.number().int(); // Integer only
z.number().positive(); // > 0
z.number().min(0); // >= 0
z.number().max(100); // <= 100
z.coerce.number(); // Parse string to number
```

### Date Validation

```typescript
z.date(); // Date object
z.coerce.date(); // Parse string/number to Date
z.coerce.date().min(new Date()); // Future dates only
```

### Enum Validation

```typescript
export const PrioritySchema = z.enum(["low", "medium", "high"]);
export type Priority = z.infer<typeof PrioritySchema>;

// Usage in object
z.object({
  priority: PrioritySchema.default("medium"),
});
```

### Optional vs Nullable

```typescript
z.string().optional(); // string | undefined
z.string().nullable(); // string | null
z.string().optional().nullable(); // string | null | undefined
z.string().nullish(); // string | null | undefined
```

### Default Values

```typescript
z.string().default("untitled"); // Default if undefined
z.boolean().default(false); // Default boolean
z.enum(["a", "b"]).default("a"); // Default enum
```

### Transforms

```typescript
z.string().transform((val) => val.toLowerCase());
z.string().transform((val) => val.trim());
z.string()
  .optional()
  .transform((val) => {
    if (val === "true") return true;
    if (val === "false") return false;
    return undefined;
  });
```

## Type Inference

Always use `z.infer` to derive TypeScript types from schemas:

```typescript
import { z } from "zod";

export const TodoSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
});

// Derive type from schema - always use `type`, not `interface`
export type Todo = z.infer<typeof TodoSchema>;
// Equivalent to: type Todo = { id: string; title: string; }
```

## Complete Schema File Example

```typescript
import { z } from "zod";

/**
 * i18n Error Codes for Zod validation
 */
export const ValidationErrorCodes = {
  TITLE_FIELD_REQUIRED: "TITLE_FIELD_REQUIRED",
  TITLE_FIELD_MAX_LENGTH: "TITLE_FIELD_MAX_LENGTH",
  DESCRIPTION_FIELD_MAX_LENGTH: "DESCRIPTION_FIELD_MAX_LENGTH",
  INVALID_TODO_ID_FORMAT: "INVALID_TODO_ID_FORMAT",
  INVALID_PRIORITY_VALUE: "INVALID_PRIORITY_VALUE",
  INVALID_DATE_FORMAT: "INVALID_DATE_FORMAT",
} as const;

export const PrioritySchema = z.enum(["low", "medium", "high"], {
  message: ValidationErrorCodes.INVALID_PRIORITY_VALUE,
});
export type Priority = z.infer<typeof PrioritySchema>;

export const TodoSchema = z.object({
  id: z.string().uuid({ message: ValidationErrorCodes.INVALID_TODO_ID_FORMAT }),
  title: z
    .string()
    .min(1, { message: ValidationErrorCodes.TITLE_FIELD_REQUIRED })
    .max(200, { message: ValidationErrorCodes.TITLE_FIELD_MAX_LENGTH }),
  description: z
    .string()
    .max(1000, { message: ValidationErrorCodes.DESCRIPTION_FIELD_MAX_LENGTH })
    .optional(),
  priority: PrioritySchema.default("medium"),
  dueDate: z.coerce
    .date({ message: ValidationErrorCodes.INVALID_DATE_FORMAT })
    .optional(),
  completed: z.boolean().default(false),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Todo = z.infer<typeof TodoSchema>;

export const CreateTodoInputSchema = z.object({
  title: z
    .string()
    .min(1, { message: ValidationErrorCodes.TITLE_FIELD_REQUIRED })
    .max(200, { message: ValidationErrorCodes.TITLE_FIELD_MAX_LENGTH }),
  description: z
    .string()
    .max(1000, { message: ValidationErrorCodes.DESCRIPTION_FIELD_MAX_LENGTH })
    .optional(),
  priority: PrioritySchema.optional().default("medium"),
  dueDate: z.coerce
    .date({ message: ValidationErrorCodes.INVALID_DATE_FORMAT })
    .optional(),
});

export type CreateTodoInput = z.infer<typeof CreateTodoInputSchema>;

export const UpdateTodoInputSchema = z.object({
  title: z
    .string()
    .min(1, { message: ValidationErrorCodes.TITLE_FIELD_REQUIRED })
    .max(200, { message: ValidationErrorCodes.TITLE_FIELD_MAX_LENGTH })
    .optional(),
  description: z
    .string()
    .max(1000, { message: ValidationErrorCodes.DESCRIPTION_FIELD_MAX_LENGTH })
    .optional(),
  priority: PrioritySchema.optional(),
  dueDate: z.coerce
    .date({ message: ValidationErrorCodes.INVALID_DATE_FORMAT })
    .optional()
    .nullable(),
  completed: z.boolean().optional(),
});

export type UpdateTodoInput = z.infer<typeof UpdateTodoInputSchema>;

export const TodoIdParamSchema = z.object({
  id: z.string().uuid({ message: ValidationErrorCodes.INVALID_TODO_ID_FORMAT }),
});

export type TodoIdParam = z.infer<typeof TodoIdParamSchema>;

export const ListTodosQuerySchema = z.object({
  completed: z
    .string()
    .optional()
    .transform((val) => {
      if (val === "true") return true;
      if (val === "false") return false;
      return undefined;
    }),
  priority: PrioritySchema.optional(),
});

export type ListTodosQuery = z.infer<typeof ListTodosQuerySchema>;
```

## Zod v4 Migration Notes

### Deprecated: `error.flatten()`

In Zod v4, `error.flatten()` is deprecated. Use `z.flattenError()` instead:

```typescript
// ❌ Deprecated (Zod v3)
const errors = parseResult.error.flatten();

// ✅ Correct (Zod v4)
const errors = z.flattenError(parseResult.error);
```

## Best Practices

1. **Use `type` not `interface`** - Always derive types using `z.infer<typeof Schema>`
2. **Use i18n error codes** - Use error codes like `TITLE_FIELD_REQUIRED` instead of human-readable messages
3. **Validate in handlers** - Never validate in route definitions
4. **Use safeParse** - Always use `safeParse` to handle validation errors gracefully
5. **Use z.flattenError()** - Use Zod v4's top-level utility for error flattening
6. **Group related schemas** - Keep all schemas for a resource in one file
7. **Export types** - Export both schema and inferred type
8. **Use coerce for external input** - Use `z.coerce.date()` for date strings from requests
9. **Define ValidationErrorCodes** - Keep all error codes in a single exported constant
