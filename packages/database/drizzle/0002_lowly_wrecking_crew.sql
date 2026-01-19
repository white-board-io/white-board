CREATE INDEX "todos_created_at_idx" ON "todos" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "todos_completed_idx" ON "todos" USING btree ("completed");