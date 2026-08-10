CREATE TABLE IF NOT EXISTS "cards" (
	"code" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type_code" text NOT NULL,
	"faction_code" text NOT NULL,
	"cost" integer,
	"income" integer,
	"initiative" integer,
	"claim" integer,
	"reserve" integer,
	"text" text DEFAULT '' NOT NULL,
	"traits_raw" text DEFAULT '' NOT NULL,
	"traits" text[] DEFAULT '{}'::text[] NOT NULL,
	"is_loyal" boolean DEFAULT false NOT NULL,
	"is_unique" boolean DEFAULT false NOT NULL,
	"is_military" boolean DEFAULT false NOT NULL,
	"is_intrigue" boolean DEFAULT false NOT NULL,
	"is_power" boolean DEFAULT false NOT NULL,
	"strength" integer,
	"deck_limit" integer DEFAULT 3 NOT NULL,
	"quantity_in_pack" integer DEFAULT 1 NOT NULL,
	"pack_code" text NOT NULL,
	"illustrator" text,
	"flavor" text,
	"octgn_id" text,
	"position" integer DEFAULT 0 NOT NULL,
	"image_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "cycles" (
	"code" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"position" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "factions" (
	"code" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"is_primary" boolean DEFAULT true NOT NULL,
	"octgn_id" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "import_runs" (
	"id" text PRIMARY KEY NOT NULL,
	"pack_codes" text[] NOT NULL,
	"cards_inserted" integer DEFAULT 0 NOT NULL,
	"cards_updated" integer DEFAULT 0 NOT NULL,
	"cards_skipped" integer DEFAULT 0 NOT NULL,
	"ran_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "packs" (
	"code" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"cycle_code" text NOT NULL,
	"position" integer NOT NULL,
	"size" integer,
	"date_release" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "types" (
	"code" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cards" ADD CONSTRAINT "cards_type_code_types_code_fk" FOREIGN KEY ("type_code") REFERENCES "public"."types"("code") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cards" ADD CONSTRAINT "cards_faction_code_factions_code_fk" FOREIGN KEY ("faction_code") REFERENCES "public"."factions"("code") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "cards" ADD CONSTRAINT "cards_pack_code_packs_code_fk" FOREIGN KEY ("pack_code") REFERENCES "public"."packs"("code") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "packs" ADD CONSTRAINT "packs_cycle_code_cycles_code_fk" FOREIGN KEY ("cycle_code") REFERENCES "public"."cycles"("code") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cards_faction_idx" ON "cards" USING btree ("faction_code");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cards_type_idx" ON "cards" USING btree ("type_code");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cards_cost_idx" ON "cards" USING btree ("cost");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cards_traits_idx" ON "cards" USING gin ("traits");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "cards_search_idx" ON "cards" USING gin (to_tsvector('english', coalesce("name", '') || ' ' || coalesce("text", '')));