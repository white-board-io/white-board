CREATE INDEX "created_at_idx" ON "todos" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "completed_idx" ON "todos" USING btree ("completed");--> statement-breakpoint
CREATE INDEX "priority_idx" ON "todos" USING btree ("priority");