CREATE INDEX "todos_created_at_idx" ON "todos" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "todos_completed_created_at_idx" ON "todos" USING btree ("completed","created_at");--> statement-breakpoint
CREATE INDEX "todos_priority_created_at_idx" ON "todos" USING btree ("priority","created_at");--> statement-breakpoint
CREATE INDEX "todos_title_lower_idx" ON "todos" USING btree (lower("title"));