CREATE TYPE "meal_type" AS ENUM('breakfast', 'lunch', 'dinner', 'snack');--> statement-breakpoint
CREATE TABLE "food_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" text,
	"name" text NOT NULL,
	"serving_size" numeric NOT NULL,
	"serving_unit" text NOT NULL,
	"calories" numeric NOT NULL,
	"protein_g" numeric NOT NULL,
	"carbs_g" numeric NOT NULL,
	"fat_g" numeric NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "meal_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"meal_id" uuid NOT NULL,
	"food_item_id" uuid NOT NULL,
	"servings" numeric NOT NULL,
	"calories" numeric NOT NULL,
	"protein_g" numeric NOT NULL,
	"carbs_g" numeric NOT NULL,
	"fat_g" numeric NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "meals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" text NOT NULL,
	"meal_type" "meal_type" NOT NULL,
	"eaten_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "food_items_user_name_idx" ON "food_items" ("user_id","name");--> statement-breakpoint
CREATE INDEX "meal_items_meal_id_idx" ON "meal_items" ("meal_id");--> statement-breakpoint
CREATE INDEX "meal_items_food_item_id_idx" ON "meal_items" ("food_item_id");--> statement-breakpoint
CREATE INDEX "meals_user_eaten_at_idx" ON "meals" ("user_id","eaten_at" DESC NULLS LAST);--> statement-breakpoint
ALTER TABLE "meal_items" ADD CONSTRAINT "meal_items_meal_id_meals_id_fkey" FOREIGN KEY ("meal_id") REFERENCES "meals"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "meal_items" ADD CONSTRAINT "meal_items_food_item_id_food_items_id_fkey" FOREIGN KEY ("food_item_id") REFERENCES "food_items"("id") ON DELETE RESTRICT;