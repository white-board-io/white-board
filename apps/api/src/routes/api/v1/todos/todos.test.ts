import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { build } from '../../../../test-utils/helper';
import { FastifyInstance } from 'fastify';

const isDummyDB = process.env.DATABASE_URL === 'postgres://postgres:postgres@localhost:5432/test';
describe.skipIf(!process.env.DATABASE_URL || isDummyDB)("TODO API endpoints", () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    const { todoRepository } = await import('../../../../modules/todo/repository/todo.repository');
    await todoRepository.clear();
    app = await build();
  });

  afterEach(async () => {
    await app.close();
  });

  describe("POST /api/v1/todos", () => {
    it("should create a new todo with valid data", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/todos",
        payload: {
          title: "Buy groceries",
          description: "Milk, eggs, bread",
          priority: "high",
        },
      });

      const body = JSON.parse(res.payload);

      expect(res.statusCode).toBe(201);
      expect(body.success).toBe(true);
      expect(body.data.title).toBe("Buy groceries");
      expect(body.data.description).toBe("Milk, eggs, bread");
      expect(body.data.priority).toBe("high");
      expect(body.data.completed).toBe(false);
      expect(body.data.id).toBeDefined();
      expect(body.data.createdAt).toBeDefined();
      expect(body.data.updatedAt).toBeDefined();
    });

    it("should return 400 for missing title", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/todos",
        payload: {
          description: "Some description",
        },
      });

      const body = JSON.parse(res.payload);

      expect(res.statusCode).toBe(400);
      expect(body.success).toBe(false);
      expect(body.error.code).toBe("VALIDATION_ERROR");
    });

    it("should return 409 for duplicate title", async () => {
      // Create first todo
      await app.inject({
        method: "POST",
        url: "/api/v1/todos",
        payload: { title: "Unique Task" },
      });

      // Try to create duplicate
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/todos",
        payload: { title: "Unique Task" },
      });

      const body = JSON.parse(res.payload);

      expect(res.statusCode).toBe(409);
      expect(body.success).toBe(false);
      expect(body.error.code).toBe("DUPLICATE_ERROR");
    });

    it("should use default priority when not specified", async () => {
      const res = await app.inject({
        method: "POST",
        url: "/api/v1/todos",
        payload: { title: "Task without priority" },
      });

      const body = JSON.parse(res.payload);

      expect(res.statusCode).toBe(201);
      expect(body.data.priority).toBe("medium");
    });
  });

  describe("GET /api/v1/todos", () => {
    it("should return empty array when no todos exist", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/api/v1/todos",
      });

      const body = JSON.parse(res.payload);

      expect(res.statusCode).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data).toEqual([]);
    });

    it("should return all todos", async () => {
      // Create two todos
      await app.inject({
        method: "POST",
        url: "/api/v1/todos",
        payload: { title: "Task 1" },
      });
      await app.inject({
        method: "POST",
        url: "/api/v1/todos",
        payload: { title: "Task 2" },
      });

      const res = await app.inject({
        method: "GET",
        url: "/api/v1/todos",
      });

      const body = JSON.parse(res.payload);

      expect(res.statusCode).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data.length).toBe(2);
    });

    it("should filter by completed status", async () => {
      // Create and complete a todo
      const createRes = await app.inject({
        method: "POST",
        url: "/api/v1/todos",
        payload: { title: "Completed Task" },
      });
      const createdTodo = JSON.parse(createRes.payload).data;

      await app.inject({
        method: "PATCH",
        url: `/api/v1/todos/${createdTodo.id}/toggle`,
      });

      // Create an incomplete todo
      await app.inject({
        method: "POST",
        url: "/api/v1/todos",
        payload: { title: "Incomplete Task" },
      });

      // Filter by completed=true
      const res = await app.inject({
        method: "GET",
        url: "/api/v1/todos?completed=true",
      });

      const body = JSON.parse(res.payload);

      expect(res.statusCode).toBe(200);
      expect(body.data.length).toBe(1);
      expect(body.data[0].title).toBe("Completed Task");
      expect(body.data[0].completed).toBe(true);
    });
  });

  describe("GET /api/v1/todos/:id", () => {
    it("should return todo for valid ID", async () => {
      // Create a todo
      const createRes = await app.inject({
        method: "POST",
        url: "/api/v1/todos",
        payload: { title: "Test Task", priority: "low" },
      });
      const createdTodo = JSON.parse(createRes.payload).data;

      const res = await app.inject({
        method: "GET",
        url: `/api/v1/todos/${createdTodo.id}`,
      });

      const body = JSON.parse(res.payload);

      expect(res.statusCode).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data.id).toBe(createdTodo.id);
      expect(body.data.title).toBe("Test Task");
    });

    it("should return 404 for non-existent ID", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/api/v1/todos/00000000-0000-0000-0000-000000000000",
      });

      const body = JSON.parse(res.payload);

      expect(res.statusCode).toBe(404);
      expect(body.success).toBe(false);
      expect(body.error.code).toBe("NOT_FOUND");
    });

    it("should return 400 for invalid ID format", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/api/v1/todos/invalid-id",
      });

      const body = JSON.parse(res.payload);

      expect(res.statusCode).toBe(400);
      expect(body.success).toBe(false);
      expect(body.error.code).toBe("VALIDATION_ERROR");
    });
  });

  describe("PUT /api/v1/todos/:id", () => {
    it("should update todo successfully", async () => {
      // Create a todo
      const createRes = await app.inject({
        method: "POST",
        url: "/api/v1/todos",
        payload: { title: "Original Title", priority: "low" },
      });
      const createdTodo = JSON.parse(createRes.payload).data;

      const res = await app.inject({
        method: "PUT",
        url: `/api/v1/todos/${createdTodo.id}`,
        payload: {
          title: "Updated Title",
          priority: "high",
          description: "Added description",
        },
      });

      const body = JSON.parse(res.payload);

      expect(res.statusCode).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data.title).toBe("Updated Title");
      expect(body.data.priority).toBe("high");
      expect(body.data.description).toBe("Added description");
    });

    it("should return 404 for non-existent todo", async () => {
      const res = await app.inject({
        method: "PUT",
        url: "/api/v1/todos/00000000-0000-0000-0000-000000000000",
        payload: { title: "Updated" },
      });

      const body = JSON.parse(res.payload);

      expect(res.statusCode).toBe(404);
      expect(body.error.code).toBe("NOT_FOUND");
    });

    it("should return 409 for duplicate title on update", async () => {
      // Create two todos
      const createRes1 = await app.inject({
        method: "POST",
        url: "/api/v1/todos",
        payload: { title: "Task One" },
      });
      const todo1 = JSON.parse(createRes1.payload).data;

      await app.inject({
        method: "POST",
        url: "/api/v1/todos",
        payload: { title: "Task Two" },
      });

      // Try to update todo1 with todo2's title
      const res = await app.inject({
        method: "PUT",
        url: `/api/v1/todos/${todo1.id}`,
        payload: { title: "Task Two" },
      });

      const body = JSON.parse(res.payload);

      expect(res.statusCode).toBe(409);
      expect(body.error.code).toBe("DUPLICATE_ERROR");
    });
  });

  describe("DELETE /api/v1/todos/:id", () => {
    it("should delete todo successfully", async () => {
      // Create a todo
      const createRes = await app.inject({
        method: "POST",
        url: "/api/v1/todos",
        payload: { title: "To Be Deleted" },
      });
      const createdTodo = JSON.parse(createRes.payload).data;

      const res = await app.inject({
        method: "DELETE",
        url: `/api/v1/todos/${createdTodo.id}`,
      });

      const body = JSON.parse(res.payload);

      expect(res.statusCode).toBe(200);
      expect(body.success).toBe(true);

      // Verify it's gone
      const getRes = await app.inject({
        method: "GET",
        url: `/api/v1/todos/${createdTodo.id}`,
      });
      expect(getRes.statusCode).toBe(404);
    });

    it("should return 404 for non-existent todo", async () => {
      const res = await app.inject({
        method: "DELETE",
        url: "/api/v1/todos/00000000-0000-0000-0000-000000000000",
      });

      const body = JSON.parse(res.payload);

      expect(res.statusCode).toBe(404);
      expect(body.error.code).toBe("NOT_FOUND");
    });
  });

  describe("PATCH /api/v1/todos/:id/toggle", () => {
    it("should toggle completed status from false to true", async () => {
      // Create a todo
      const createRes = await app.inject({
        method: "POST",
        url: "/api/v1/todos",
        payload: { title: "Toggle Test" },
      });
      const createdTodo = JSON.parse(createRes.payload).data;
      expect(createdTodo.completed).toBe(false);

      // Toggle
      const res = await app.inject({
        method: "PATCH",
        url: `/api/v1/todos/${createdTodo.id}/toggle`,
      });

      const body = JSON.parse(res.payload);

      expect(res.statusCode).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data.completed).toBe(true);
    });

    it("should toggle completed status from true to false", async () => {
      // Create and toggle a todo
      const createRes = await app.inject({
        method: "POST",
        url: "/api/v1/todos",
        payload: { title: "Toggle Test 2" },
      });
      const createdTodo = JSON.parse(createRes.payload).data;

      // Toggle to true
      await app.inject({
        method: "PATCH",
        url: `/api/v1/todos/${createdTodo.id}/toggle`,
      });

      // Toggle back to false
      const res = await app.inject({
        method: "PATCH",
        url: `/api/v1/todos/${createdTodo.id}/toggle`,
      });

      const body = JSON.parse(res.payload);

      expect(res.statusCode).toBe(200);
      expect(body.data.completed).toBe(false);
    });

    it("should return 404 for non-existent todo", async () => {
      const res = await app.inject({
        method: "PATCH",
        url: "/api/v1/todos/00000000-0000-0000-0000-000000000000/toggle",
      });

      const body = JSON.parse(res.payload);

      expect(res.statusCode).toBe(404);
      expect(body.error.code).toBe("NOT_FOUND");
    });
  });
});
