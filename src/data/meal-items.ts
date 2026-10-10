import "server-only";
import { auth } from "@clerk/nextjs/server";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { mealItems, meals } from "@/db/schema";

type Food = {
  calories: string;
  proteinG: string;
  carbsG: string;
  fatG: string;
};

// Snapshot of food value x servings, rounded to 2 decimals.
function snapshot(food: Food, servings: number) {
  const scale = (v: string) => String(Math.round(Number(v) * servings * 100) / 100);
  return {
    servings: String(servings),
    calories: scale(food.calories),
    proteinG: scale(food.proteinG),
    carbsG: scale(food.carbsG),
    fatG: scale(food.fatG),
  };
}

export async function addMealItem(data: {
  mealId: string;
  foodItemId: string;
  servings: number;
}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const meal = await db.query.meals.findFirst({
    where: { id: data.mealId, userId },
    columns: { id: true },
  });
  if (!meal) throw new Error("Meal not found");

  const food = await db.query.foodItems.findFirst({
    where: {
      id: data.foodItemId,
      OR: [{ userId: { isNull: true } }, { userId }],
    },
  });
  if (!food) throw new Error("Food not found");

  const [item] = await db
    .insert(mealItems)
    .values({
      mealId: meal.id,
      foodItemId: food.id,
      ...snapshot(food, data.servings),
    })
    .returning({ id: mealItems.id });
  return item;
}

export async function updateMealItemServings(id: string, servings: number) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const item = await db.query.mealItems.findFirst({
    where: { id, meal: { userId } },
    with: { foodItem: true },
  });
  if (!item) throw new Error("Item not found");

  const [updated] = await db
    .update(mealItems)
    .set(snapshot(item.foodItem, servings))
    .where(
      and(
        eq(mealItems.id, id),
        inArray(
          mealItems.mealId,
          db.select({ id: meals.id }).from(meals).where(eq(meals.userId, userId)),
        ),
      ),
    )
    .returning({ id: mealItems.id, mealId: mealItems.mealId });
  if (!updated) throw new Error("Item not found");
  return updated;
}

export async function removeMealItem(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const [removed] = await db
    .delete(mealItems)
    .where(
      and(
        eq(mealItems.id, id),
        inArray(
          mealItems.mealId,
          db.select({ id: meals.id }).from(meals).where(eq(meals.userId, userId)),
        ),
      ),
    )
    .returning({ id: mealItems.id, mealId: mealItems.mealId });
  if (!removed) throw new Error("Item not found");
  return removed;
}
