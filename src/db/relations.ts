import { defineRelations } from "drizzle-orm";
import * as schema from "./schema";

export const relations = defineRelations(schema, (r) => ({
  meals: {
    items: r.many.mealItems({
      from: r.meals.id,
      to: r.mealItems.mealId,
    }),
  },
  foodItems: {
    mealItems: r.many.mealItems({
      from: r.foodItems.id,
      to: r.mealItems.foodItemId,
    }),
  },
  mealItems: {
    meal: r.one.meals({
      from: r.mealItems.mealId,
      to: r.meals.id,
      optional: false,
    }),
    foodItem: r.one.foodItems({
      from: r.mealItems.foodItemId,
      to: r.foodItems.id,
      optional: false,
    }),
  },
}));
