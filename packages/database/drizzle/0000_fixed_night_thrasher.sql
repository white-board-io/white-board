CREATE TYPE "public"."priority" AS ENUM('low', 'medium', 'high');--> statement-breakpoint
CREATE TABLE "todos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(200) NOT NULL,
	"description" text,
	"priority" "priority" DEFAULT 'medium' NOT NULL,
	"due_date" timestamp,
	"completed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
