"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createMeal } from "@/data/meals";

const createMealSchema = z.object({
  mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]),
  eatenAt: z.coerce.date(),
});

type CreateMealInput = z.infer<typeof createMealSchema>;

export async function createMealAction(input: CreateMealInput) {
  const data = createMealSchema.parse(input);
  const meal = await createMeal(data);
  revalidatePath("/dashboard");
  return { id: meal.id };
}
