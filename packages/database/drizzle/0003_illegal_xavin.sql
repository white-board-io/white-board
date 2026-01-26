CREATE INDEX "created_at_idx" ON "todos" USING btree ("created_at" DESC NULLS FIRST);--> statement-breakpoint
CREATE INDEX "completed_created_at_idx" ON "todos" USING btree ("completed","created_at" DESC NULLS FIRST);--> statement-breakpoint
CREATE INDEX "priority_created_at_idx" ON "todos" USING btree ("priority","created_at" DESC NULLS FIRST);