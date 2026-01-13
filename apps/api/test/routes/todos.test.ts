import { test, describe, beforeEach } from "node:test";
import * as assert from "node:assert";
import { build } from "../helper";
import { todoRepository } from "../../src/modules/todo/repository/todo.repository";

describe("TODO API endpoints", () => {
  // Clear the in-memory store before each test
  beforeEach(async () => {
    await todoRepository.clear();
  });

  describe("POST /api/v1/todos", () => {
    test("should create a new todo with valid data", async (t) => {
      const app = await build(t);

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

      assert.strictEqual(res.statusCode, 201);
      assert.strictEqual(body.success, true);
      assert.strictEqual(body.data.title, "Buy groceries");
      assert.strictEqual(body.data.description, "Milk, eggs, bread");
      assert.strictEqual(body.data.priority, "high");
      assert.strictEqual(body.data.completed, false);
      assert.ok(body.data.id);
      assert.ok(body.data.createdAt);
      assert.ok(body.data.updatedAt);
    });

    test("should return 400 for missing title", async (t) => {
      const app = await build(t);

      const res = await app.inject({
        method: "POST",
        url: "/api/v1/todos",
        payload: {
          description: "Some description",
        },
      });

      const body = JSON.parse(res.payload);

      assert.strictEqual(res.statusCode, 400);
      assert.strictEqual(body.success, false);
      assert.strictEqual(body.error.code, "VALIDATION_ERROR");
    });

    test("should return 409 for duplicate title", async (t) => {
      const app = await build(t);

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

      assert.strictEqual(res.statusCode, 409);
      assert.strictEqual(body.success, false);
      assert.strictEqual(body.error.code, "DUPLICATE_ERROR");
    });

    test("should use default priority when not specified", async (t) => {
      const app = await build(t);

      const res = await app.inject({
        method: "POST",
        url: "/api/v1/todos",
        payload: { title: "Task without priority" },
      });

      const body = JSON.parse(res.payload);

      assert.strictEqual(res.statusCode, 201);
      assert.strictEqual(body.data.priority, "medium");
    });
  });

  describe("GET /api/v1/todos", () => {
    test("should return empty array when no todos exist", async (t) => {
      const app = await build(t);

      const res = await app.inject({
        method: "GET",
        url: "/api/v1/todos",
      });

      const body = JSON.parse(res.payload);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(body.success, true);
      assert.deepStrictEqual(body.data, []);
    });

    test("should return all todos", async (t) => {
      const app = await build(t);

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

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(body.success, true);
      assert.strictEqual(body.data.length, 2);
    });

    test("should filter by completed status", async (t) => {
      const app = await build(t);

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

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(body.data.length, 1);
      assert.strictEqual(body.data[0].title, "Completed Task");
      assert.strictEqual(body.data[0].completed, true);
    });
  });

  describe("GET /api/v1/todos/:id", () => {
    test("should return todo for valid ID", async (t) => {
      const app = await build(t);

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

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(body.success, true);
      assert.strictEqual(body.data.id, createdTodo.id);
      assert.strictEqual(body.data.title, "Test Task");
    });

    test("should return 404 for non-existent ID", async (t) => {
      const app = await build(t);

      const res = await app.inject({
        method: "GET",
        url: "/api/v1/todos/00000000-0000-0000-0000-000000000000",
      });

      const body = JSON.parse(res.payload);

      assert.strictEqual(res.statusCode, 404);
      assert.strictEqual(body.success, false);
      assert.strictEqual(body.error.code, "NOT_FOUND");
    });

    test("should return 400 for invalid ID format", async (t) => {
      const app = await build(t);

      const res = await app.inject({
        method: "GET",
        url: "/api/v1/todos/invalid-id",
      });

      const body = JSON.parse(res.payload);

      assert.strictEqual(res.statusCode, 400);
      assert.strictEqual(body.success, false);
      assert.strictEqual(body.error.code, "VALIDATION_ERROR");
    });
  });

  describe("PUT /api/v1/todos/:id", () => {
    test("should update todo successfully", async (t) => {
      const app = await build(t);

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

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(body.success, true);
      assert.strictEqual(body.data.title, "Updated Title");
      assert.strictEqual(body.data.priority, "high");
      assert.strictEqual(body.data.description, "Added description");
    });

    test("should return 404 for non-existent todo", async (t) => {
      const app = await build(t);

      const res = await app.inject({
        method: "PUT",
        url: "/api/v1/todos/00000000-0000-0000-0000-000000000000",
        payload: { title: "Updated" },
      });

      const body = JSON.parse(res.payload);

      assert.strictEqual(res.statusCode, 404);
      assert.strictEqual(body.error.code, "NOT_FOUND");
    });

    test("should return 409 for duplicate title on update", async (t) => {
      const app = await build(t);

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

      assert.strictEqual(res.statusCode, 409);
      assert.strictEqual(body.error.code, "DUPLICATE_ERROR");
    });
  });

  describe("DELETE /api/v1/todos/:id", () => {
    test("should delete todo successfully", async (t) => {
      const app = await build(t);

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

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(body.success, true);

      // Verify it's gone
      const getRes = await app.inject({
        method: "GET",
        url: `/api/v1/todos/${createdTodo.id}`,
      });
      assert.strictEqual(getRes.statusCode, 404);
    });

    test("should return 404 for non-existent todo", async (t) => {
      const app = await build(t);

      const res = await app.inject({
        method: "DELETE",
        url: "/api/v1/todos/00000000-0000-0000-0000-000000000000",
      });

      const body = JSON.parse(res.payload);

      assert.strictEqual(res.statusCode, 404);
      assert.strictEqual(body.error.code, "NOT_FOUND");
    });
  });

  describe("PATCH /api/v1/todos/:id/toggle", () => {
    test("should toggle completed status from false to true", async (t) => {
      const app = await build(t);

      // Create a todo
      const createRes = await app.inject({
        method: "POST",
        url: "/api/v1/todos",
        payload: { title: "Toggle Test" },
      });
      const createdTodo = JSON.parse(createRes.payload).data;
      assert.strictEqual(createdTodo.completed, false);

      // Toggle
      const res = await app.inject({
        method: "PATCH",
        url: `/api/v1/todos/${createdTodo.id}/toggle`,
      });

      const body = JSON.parse(res.payload);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(body.success, true);
      assert.strictEqual(body.data.completed, true);
    });

    test("should toggle completed status from true to false", async (t) => {
      const app = await build(t);

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

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(body.data.completed, false);
    });

    test("should return 404 for non-existent todo", async (t) => {
      const app = await build(t);

      const res = await app.inject({
        method: "PATCH",
        url: "/api/v1/todos/00000000-0000-0000-0000-000000000000/toggle",
      });

      const body = JSON.parse(res.payload);

      assert.strictEqual(res.statusCode, 404);
      assert.strictEqual(body.error.code, "NOT_FOUND");
    });
  });
});
