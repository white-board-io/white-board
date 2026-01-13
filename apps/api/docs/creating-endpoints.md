---
title: Creating Endpoints
description: Step-by-step guide for adding new API endpoints
category: guides
---

# Creating Endpoints

This guide walks through creating a new API endpoint following the project's patterns and conventions.

## Overview

Adding a new endpoint involves:

1. Define Zod schemas
2. Create command or query handler
3. Add route handler
4. (Optional) Add business validators
5. (Optional) Add repository methods

## Step-by-Step Example: Creating a "Notes" Resource

### Step 1: Create the Schema

Create `src/modules/note/schemas/note.schema.ts`:

```typescript
import { z } from "zod";

export const NoteSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(100),
  content: z.string().max(5000),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Note = z.infer<typeof NoteSchema>;

export const CreateNoteInputSchema = z.object({
  title: z.string().min(1).max(100),
  content: z.string().max(5000).optional(),
});

export type CreateNoteInput = z.infer<typeof CreateNoteInputSchema>;

export const NoteIdParamSchema = z.object({
  id: z.string().uuid("Invalid note ID format"),
});

export type NoteIdParam = z.infer<typeof NoteIdParamSchema>;
```

### Step 2: Create the Repository

Create `src/modules/note/repository/note.repository.ts`:

```typescript
import type { Note, CreateNoteInput } from "../schemas/note.schema";
import { v4 as uuidv4 } from "uuid";

const noteStore = new Map<string, Note>();

export const noteRepository = {
  findAll: async (): Promise<Note[]> => {
    return Array.from(noteStore.values());
  },

  findById: async (id: string): Promise<Note | undefined> => {
    return noteStore.get(id);
  },

  create: async (input: CreateNoteInput): Promise<Note> => {
    const now = new Date();
    const note: Note = {
      id: uuidv4(),
      title: input.title,
      content: input.content ?? "",
      createdAt: now,
      updatedAt: now,
    };
    noteStore.set(note.id, note);
    return note;
  },

  delete: async (id: string): Promise<boolean> => {
    return noteStore.delete(id);
  },
};
```

### Step 3: Create the Command Handler

Create `src/modules/note/commands/create-note.command.ts`:

```typescript
import { CreateNoteInputSchema, type CreateNoteInput, type Note } from "../schemas/note.schema";
import { noteRepository } from "../repository/note.repository";
import { createValidationError } from "../../../shared/errors/app-error";
import type { LoggerHelpers } from "../../../plugins/logger";

export type CreateNoteCommandResult = {
  data: Note;
};

export async function createNoteHandler(
  input: unknown,
  logger: LoggerHelpers
): Promise<CreateNoteCommandResult> {
  logger.debug("CreateNoteCommand received", { input });

  const parseResult = CreateNoteInputSchema.safeParse(input);
  if (!parseResult.success) {
    const errors = parseResult.error.flatten();
    logger.warn("Validation failed for CreateNoteCommand", { errors });
    throw createValidationError({ fieldErrors: errors.fieldErrors });
  }

  const validatedInput: CreateNoteInput = parseResult.data;
  const note = await noteRepository.create(validatedInput);

  logger.info("Note created successfully", { noteId: note.id, title: note.title });

  return { data: note };
}
```

### Step 4: Create the Query Handler

Create `src/modules/note/queries/get-note-by-id.query.ts`:

```typescript
import type { Note } from "../schemas/note.schema";
import { NoteIdParamSchema } from "../schemas/note.schema";
import { noteRepository } from "../repository/note.repository";
import { createNotFoundError, createValidationError } from "../../../shared/errors/app-error";
import type { LoggerHelpers } from "../../../plugins/logger";

export type GetNoteByIdQueryResult = {
  data: Note;
};

export async function getNoteByIdHandler(
  id: unknown,
  logger: LoggerHelpers
): Promise<GetNoteByIdQueryResult> {
  logger.debug("GetNoteByIdQuery received", { id });

  const parseResult = NoteIdParamSchema.safeParse({ id });
  if (!parseResult.success) {
    const errors = parseResult.error.flatten();
    logger.warn("Invalid note ID format", { id, errors });
    throw createValidationError({ fieldErrors: errors.fieldErrors });
  }

  const validatedId = parseResult.data.id;
  const note = await noteRepository.findById(validatedId);

  if (!note) {
    logger.warn("Note not found", { id: validatedId });
    throw createNotFoundError("Note", validatedId);
  }

  logger.debug("Note retrieved", { noteId: validatedId });

  return { data: note };
}
```

### Step 5: Create the Route Handler

Create `src/routes/api/v1/notes/index.ts`:

```typescript
import { FastifyPluginAsync } from "fastify";
import { createNoteHandler } from "../../../../modules/note/commands/create-note.command";
import { getNoteByIdHandler } from "../../../../modules/note/queries/get-note-by-id.query";
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

  fastify.get("/:id", async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const result = await getNoteByIdHandler(id, fastify.logger);
      return reply.send(result);
    } catch (error) {
      return handleError(error, reply);
    }
  });
};

export default notesRoutes;
```

## Route Handler Pattern

Every route handler follows this pattern:

```typescript
fastify.{method}("/{path}", async (request, reply) => {
  try {
    const result = await {handler}({params}, fastify.logger);
    return reply.status({code}).send(result);
  } catch (error) {
    return handleError(error, reply);
  }
});
```

### HTTP Methods

| Method | Handler Type | Status Code |
|--------|--------------|-------------|
| POST | Command (create) | 201 |
| GET | Query | 200 |
| PUT | Command (update) | 200 |
| PATCH | Command (partial update) | 200 |
| DELETE | Command (delete) | 200 |

## Handler Signature

All handlers receive raw input and a logger:

```typescript
export async function {handlerName}(
  input: unknown,           // Raw input (validate inside handler)
  logger: LoggerHelpers     // Logger instance
): Promise<{ResultType}> {
  // 1. Validate input with Zod
  // 2. Execute business logic
  // 3. Log result
  // 4. Return typed result
}
```

## Checklist for New Endpoints

- [ ] Schema defined with Zod types
- [ ] Repository methods added (if new data access needed)
- [ ] Command/Query handler created
- [ ] Validation inside handler (not in route)
- [ ] Logger calls added (debug, info, warn)
- [ ] Error handling uses factory functions
- [ ] Route file created in correct directory
- [ ] No JSDoc comments on route methods
