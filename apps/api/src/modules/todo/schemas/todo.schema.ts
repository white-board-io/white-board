import { z } from "zod";

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

export const TodoResponseSchema = z.object({
  success: z.boolean(),
  data: TodoSchema.optional(),
  error: z
    .object({
      code: z.string(),
      message: z.string(),
      details: z.record(z.string(), z.unknown()).optional(),
    })
    .optional(),
});

export type TodoResponse = z.infer<typeof TodoResponseSchema>;

export const TodoListResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(TodoSchema).optional(),
  error: z
    .object({
      code: z.string(),
      message: z.string(),
      details: z.record(z.string(), z.unknown()).optional(),
    })
    .optional(),
});

export type TodoListResponse = z.infer<typeof TodoListResponseSchema>;
