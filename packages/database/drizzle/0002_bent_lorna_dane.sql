CREATE INDEX "todo_created_at_idx" ON "todos" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "todo_completed_idx" ON "todos" USING btree ("completed");--> statement-breakpoint
CREATE INDEX "todo_priority_idx" ON "todos" USING btree ("priority");