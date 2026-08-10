CREATE TABLE IF NOT EXISTS "health_checks" (
	"id" text PRIMARY KEY NOT NULL,
	"checked_at" timestamp with time zone DEFAULT now() NOT NULL
);
