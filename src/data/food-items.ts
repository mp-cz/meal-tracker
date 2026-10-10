import "server-only";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { foodItems } from "@/db/schema";

// Shared catalog foods (userId null) plus the current user's own foods.
export async function getAvailableFoodItems() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  return db.query.foodItems.findMany({
    where: { OR: [{ userId: { isNull: true } }, { userId }] },
    orderBy: { name: "asc" },
  });
}

export async function createFoodItem(data: {
  name: string;
  servingSize: number;
  servingUnit: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const [food] = await db
    .insert(foodItems)
    .values({
      userId,
      name: data.name,
      servingSize: String(data.servingSize),
      servingUnit: data.servingUnit,
      calories: String(data.calories),
      proteinG: String(data.proteinG),
      carbsG: String(data.carbsG),
      fatG: String(data.fatG),
    })
    .returning({ id: foodItems.id });
  return food;
}
