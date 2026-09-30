ALTER TABLE "users" ADD COLUMN "digital_content_waiver_version" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "past_due_since" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "cancel_at_period_end" boolean DEFAULT false NOT NULL;