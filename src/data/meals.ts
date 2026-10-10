import "server-only";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { meals } from "@/db/schema";

export async function getMealsForDay(start: Date, end: Date) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  return db.query.meals.findMany({
    where: { userId, eatenAt: { gte: start, lt: end } },
    orderBy: { eatenAt: "asc" },
    with: { items: { with: { foodItem: true } } },
  });
}

export async function createMeal(data: {
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  eatenAt: Date;
}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const [meal] = await db
    .insert(meals)
    .values({ userId, mealType: data.mealType, eatenAt: data.eatenAt })
    .returning({ id: meals.id });
  return meal;
}

export async function getMealById(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  return db.query.meals.findFirst({
    where: { id, userId },
    with: { items: { with: { foodItem: true }, orderBy: { createdAt: "asc" } } },
  });
}

export async function updateMeal(
  id: string,
  data: {
    mealType: "breakfast" | "lunch" | "dinner" | "snack";
    eatenAt: Date;
  },
) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const [meal] = await db
    .update(meals)
    .set({ mealType: data.mealType, eatenAt: data.eatenAt })
    .where(and(eq(meals.id, id), eq(meals.userId, userId)))
    .returning({ id: meals.id });
  if (!meal) throw new Error("Meal not found");
  return meal;
}
