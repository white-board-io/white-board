---
title: Schemas & Validation
description: Zod schemas for type definitions and runtime validation with i18n support
category: architecture
priority: high
---

# Schemas & Validation

This project uses [Zod](https://zod.dev) for runtime schema validation and TypeScript type inference. All validation happens inside handlers, not in route definitions.

## i18n Error Codes (Required)

All Zod validation messages MUST use **error codes** instead of human-readable strings. This enables i18n (internationalization) on the client side. Clients use these codes to display localized error messages.

### Error Code Naming Convention

| Pattern | Example | Use Case |
|---------|---------|----------|
| `{FIELD}_REQUIRED` | `EMAIL_REQUIRED` | Required field missing |
| `{FIELD}_INVALID` | `EMAIL_INVALID` | Invalid format |
| `{FIELD}_MIN_LENGTH` | `PASSWORD_MIN_LENGTH` | Too short |
| `{FIELD}_MAX_LENGTH` | `TITLE_MAX_LENGTH` | Too long |
| `INVALID_{ENTITY}_ID` | `INVALID_TODO_ID` | Invalid ID format |
| `{ENTITY}_TYPE_INVALID` | `ORGANIZATION_TYPE_INVALID` | Invalid enum value |

### Defining Error Codes

Define validation error codes as a constant object at the top of your schema file:

```typescript
import { z } from "zod";

export const ValidationErrorCodes = {
  TITLE_REQUIRED: "TITLE_REQUIRED",
  TITLE_MAX_LENGTH: "TITLE_MAX_LENGTH",
  DESCRIPTION_MAX_LENGTH: "DESCRIPTION_MAX_LENGTH",
  INVALID_TODO_ID: "INVALID_TODO_ID",
  INVALID_PRIORITY: "INVALID_PRIORITY",
  INVALID_DATE: "INVALID_DATE",
} as const;
```

### Using Error Codes in Schemas

Pass error codes using the `{ message: ... }` syntax:

```typescript
export const TodoSchema = z.object({
  id: z.string().uuid({ message: ValidationErrorCodes.INVALID_TODO_ID }),
  title: z
    .string()
    .min(1, { message: ValidationErrorCodes.TITLE_REQUIRED })
    .max(200, { message: ValidationErrorCodes.TITLE_MAX_LENGTH }),
  description: z
    .string()
    .max(1000, { message: ValidationErrorCodes.DESCRIPTION_MAX_LENGTH })
    .optional(),
  priority: PrioritySchema.default("medium"),
  dueDate: z.coerce
    .date({ message: ValidationErrorCodes.INVALID_DATE })
    .optional(),
  completed: z.boolean().default(false),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Todo = z.infer<typeof TodoSchema>;
```

### Enum Error Codes

For enums, pass the error code in the second argument:

```typescript
export const PrioritySchema = z.enum(["low", "medium", "high"], {
  message: ValidationErrorCodes.INVALID_PRIORITY,
});

export const OrganizationTypeEnum = z.enum(
  ["other", "school", "college", "tuition", "training_institute"],
  { message: AuthValidationErrorCodes.ORGANIZATION_TYPE_INVALID }
);
```

### Bad vs Good Examples

```typescript
// Bad - plain English (not i18n compatible)
z.string().min(1, "First name is required")
z.string().email("Invalid email address")
z.string().uuid("Invalid organization ID")

// Good - error codes (i18n compatible)
z.string().min(1, { message: AuthValidationErrorCodes.FIRST_NAME_REQUIRED })
z.string().email({ message: AuthValidationErrorCodes.EMAIL_INVALID })
z.string().uuid({ message: AuthValidationErrorCodes.ORGANIZATION_ID_INVALID })
```

## Schema Types

### Entity Schema

Full schema representing the database entity:

```typescript
export const TodoSchema = z.object({
  id: z.string().uuid({ message: ValidationErrorCodes.INVALID_TODO_ID }),
  title: z.string().min(1).max(200),
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
  title: z
    .string()
    .min(1, { message: ValidationErrorCodes.TITLE_REQUIRED })
    .max(200, { message: ValidationErrorCodes.TITLE_MAX_LENGTH }),
  description: z
    .string()
    .max(1000, { message: ValidationErrorCodes.DESCRIPTION_MAX_LENGTH })
    .optional(),
  priority: PrioritySchema.optional().default("medium"),
  dueDate: z.coerce
    .date({ message: ValidationErrorCodes.INVALID_DATE })
    .optional(),
});

export type CreateTodoInput = z.infer<typeof CreateTodoInputSchema>;
```

### Update Input Schema

For PUT/PATCH requests - all fields optional:

```typescript
export const UpdateTodoInputSchema = z.object({
  title: z
    .string()
    .min(1, { message: ValidationErrorCodes.TITLE_REQUIRED })
    .max(200, { message: ValidationErrorCodes.TITLE_MAX_LENGTH })
    .optional(),
  description: z
    .string()
    .max(1000, { message: ValidationErrorCodes.DESCRIPTION_MAX_LENGTH })
    .optional(),
  priority: PrioritySchema.optional(),
  dueDate: z.coerce
    .date({ message: ValidationErrorCodes.INVALID_DATE })
    .optional()
    .nullable(),
  completed: z.boolean().optional(),
});

export type UpdateTodoInput = z.infer<typeof UpdateTodoInputSchema>;
```

### ID Param Schema

For URL parameters:

```typescript
export const TodoIdParamSchema = z.object({
  id: z.string().uuid({ message: ValidationErrorCodes.INVALID_TODO_ID }),
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
  priority: PrioritySchema.optional(),
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
    const errors = z.flattenError(parseResult.error);
    logger.warn("Validation failed for CreateTodoCommand", { errors });
    throw createValidationError({ fieldErrors: errors.fieldErrors });
  }

  const validatedInput: CreateTodoInput = parseResult.data;
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
z.string()
z.string().min(1)
z.string().max(200)
z.string().min(1).max(200)
z.string().email()
z.string().url()
z.string().uuid()
z.string().regex(/^[A-Z]{3}$/)
```

### Number Validation

```typescript
z.number()
z.number().int()
z.number().positive()
z.number().min(0)
z.number().max(100)
z.coerce.number()
```

### Date Validation

```typescript
z.date()
z.coerce.date()
z.coerce.date().min(new Date())
```

### Enum Validation

```typescript
export const PrioritySchema = z.enum(["low", "medium", "high"], {
  message: ValidationErrorCodes.INVALID_PRIORITY,
});
export type Priority = z.infer<typeof PrioritySchema>;

z.object({
  priority: PrioritySchema.default("medium"),
});
```

### Optional vs Nullable

```typescript
z.string().optional()
z.string().nullable()
z.string().optional().nullable()
z.string().nullish()
```

### Default Values

```typescript
z.string().default("untitled")
z.boolean().default(false)
z.enum(["a", "b"]).default("a")
```

### Transforms

```typescript
z.string().transform((val) => val.toLowerCase())
z.string().transform((val) => val.trim())
z.string()
  .optional()
  .transform((val) => {
    if (val === "true") return true;
    if (val === "false") return false;
    return undefined;
  })
```

## Type Inference

Always use `z.infer` to derive TypeScript types from schemas:

```typescript
import { z } from "zod";

export const TodoSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
});

export type Todo = z.infer<typeof TodoSchema>;
```

## Zod v4 Migration Notes

### Deprecated: `error.flatten()`

In Zod v4, `error.flatten()` is deprecated. Use `z.flattenError()` instead:

```typescript
// Bad (Zod v3)
const errors = parseResult.error.flatten();

// Good (Zod v4)
const errors = z.flattenError(parseResult.error);
```

## Quick Reference

| Guideline | Do | Don't |
|-----------|----|----|
| Error messages | Error codes (`EMAIL_REQUIRED`) | Plain English (`"Email is required"`) |
| Type definitions | `type Todo = z.infer<typeof TodoSchema>` | `interface Todo {...}` |
| Validation location | Inside handlers | In route definitions |
| Error flattening | `z.flattenError(error)` | `error.flatten()` |
| Date parsing | `z.coerce.date()` | `z.date()` for string input |
