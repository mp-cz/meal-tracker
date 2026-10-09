import "server-only";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";

export async function getMealsForDay(start: Date, end: Date) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  return db.query.meals.findMany({
    where: { userId, eatenAt: { gte: start, lt: end } },
    orderBy: { eatenAt: "asc" },
    with: { items: { with: { foodItem: true } } },
  });
}
