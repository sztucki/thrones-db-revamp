CREATE TABLE IF NOT EXISTS "deck_cards" (
	"deck_id" text NOT NULL,
	"card_code" text NOT NULL,
	"count" integer NOT NULL,
	CONSTRAINT "deck_cards_deck_id_card_code_pk" PRIMARY KEY("deck_id","card_code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "decks" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"faction_code" text NOT NULL,
	"agenda_code" text,
	"format" text DEFAULT 'joust' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "deck_cards" ADD CONSTRAINT "deck_cards_deck_id_decks_id_fk" FOREIGN KEY ("deck_id") REFERENCES "public"."decks"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "deck_cards" ADD CONSTRAINT "deck_cards_card_code_cards_code_fk" FOREIGN KEY ("card_code") REFERENCES "public"."cards"("code") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "decks" ADD CONSTRAINT "decks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "decks" ADD CONSTRAINT "decks_faction_code_factions_code_fk" FOREIGN KEY ("faction_code") REFERENCES "public"."factions"("code") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "decks" ADD CONSTRAINT "decks_agenda_code_cards_code_fk" FOREIGN KEY ("agenda_code") REFERENCES "public"."cards"("code") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
