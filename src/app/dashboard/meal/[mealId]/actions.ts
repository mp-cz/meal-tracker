"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { updateMeal } from "@/data/meals";

const updateMealSchema = z.object({
  id: z.uuid(),
  mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]),
  eatenAt: z.coerce
    .date()
    .min(new Date("2000-01-01"), "Date is too far in the past")
    .refine(
      (d) => d.getTime() <= Date.now() + 366 * 24 * 60 * 60 * 1000,
      "Date is too far in the future",
    ),
});

type UpdateMealInput = z.infer<typeof updateMealSchema>;

export async function updateMealAction(input: UpdateMealInput) {
  const { id, ...data } = updateMealSchema.parse(input);
  const meal = await updateMeal(id, data);
  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/meal/${id}`);
  return { id: meal.id };
}
