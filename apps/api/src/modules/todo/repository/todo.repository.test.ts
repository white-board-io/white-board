import { beforeEach, describe, expect, it } from "vitest";
import { db } from "@repo/database";
import { todos } from "@repo/database/schema/todo";
import { todoRepository } from "./todo.repository";

describe("todoRepository", () => {
  beforeEach(async () => {
    await db.delete(todos);
  });

  it("creates todos with defaults and finds by id", async () => {
    const created = await todoRepository.create({ title: "Buy milk" });

    expect(created.id).toBeTypeOf("string");
    expect(created.priority).toBe("medium");
    expect(created.completed).toBe(false);
    expect(created.description).toBeUndefined();

    const found = await todoRepository.findById(created.id);
    expect(found?.title).toBe("Buy milk");
  });

  it("finds by title case-insensitively", async () => {
    await todoRepository.create({ title: "Pay Bills" });

    const found = await todoRepository.findByTitle("pay bills");
    expect(found?.title).toBe("Pay Bills");
  });

  it("filters by completed and priority", async () => {
    const low = await todoRepository.create({ title: "Low", priority: "low" });
    const high = await todoRepository.create({ title: "High", priority: "high" });

    await todoRepository.update(low.id, { completed: true });

    const completed = await todoRepository.findAll({ completed: true });
    expect(completed.map((todo) => todo.title)).toEqual(["Low"]);

    const highOnly = await todoRepository.findAll({ priority: "high" });
    expect(highOnly.map((todo) => todo.title)).toEqual(["High"]);
  });

  it("updates nullable fields without dropping falsey values", async () => {
    const dueDate = new Date("2026-01-01T00:00:00.000Z");
    const created = await todoRepository.create({
      title: "Due task",
      dueDate,
    });

    await todoRepository.update(created.id, {
      completed: true,
      dueDate: null,
    });

    const updated = await todoRepository.findById(created.id);
    expect(updated?.completed).toBe(true);
    expect(updated?.dueDate).toBeUndefined();
  });

  it("deletes todo rows", async () => {
    const created = await todoRepository.create({ title: "Delete me" });

    const deleted = await todoRepository.delete(created.id);
    expect(deleted).toBe(true);

    const found = await todoRepository.findById(created.id);
    expect(found).toBeUndefined();
  });
});
