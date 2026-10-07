import {
  index,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const mealTypeEnum = pgEnum("meal_type", [
  "breakfast",
  "lunch",
  "dinner",
  "snack",
]);

// user_id columns hold the Clerk user id; there is no local users table.
export const meals = pgTable(
  "meals",
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: text("user_id").notNull(),
    mealType: mealTypeEnum("meal_type").notNull(),
    eatenAt: timestamp("eaten_at", { withTimezone: true }).notNull().defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [index("meals_user_eaten_at_idx").on(t.userId, t.eatenAt.desc())],
);

// Food catalog. Nutrition values are per serving. userId null = shared food.
export const foodItems = pgTable(
  "food_items",
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: text("user_id"),
    name: text().notNull(),
    servingSize: numeric("serving_size").notNull(),
    servingUnit: text("serving_unit").notNull(),
    calories: numeric().notNull(),
    proteinG: numeric("protein_g").notNull(),
    carbsG: numeric("carbs_g").notNull(),
    fatG: numeric("fat_g").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("food_items_user_name_idx").on(t.userId, t.name)],
);

// Foods eaten in a meal. Nutrition columns are a snapshot (food value x servings)
// taken at log time so later edits to a food don't rewrite history.
export const mealItems = pgTable(
  "meal_items",
  {
    id: uuid().primaryKey().defaultRandom(),
    mealId: uuid("meal_id")
      .notNull()
      .references(() => meals.id, { onDelete: "cascade" }),
    foodItemId: uuid("food_item_id")
      .notNull()
      .references(() => foodItems.id, { onDelete: "restrict" }),
    servings: numeric().notNull(),
    calories: numeric().notNull(),
    proteinG: numeric("protein_g").notNull(),
    carbsG: numeric("carbs_g").notNull(),
    fatG: numeric("fat_g").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("meal_items_meal_id_idx").on(t.mealId),
    index("meal_items_food_item_id_idx").on(t.foodItemId),
  ],
);
