"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createFoodItem } from "@/data/food-items";
import {
  addMealItem,
  removeMealItem,
  updateMealItemServings,
} from "@/data/meal-items";
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

const servingsSchema = z.number().positive().max(1000);

const addMealItemSchema = z.object({
  mealId: z.uuid(),
  foodItemId: z.uuid(),
  servings: servingsSchema,
});

type AddMealItemInput = z.infer<typeof addMealItemSchema>;

export async function addMealItemAction(input: AddMealItemInput) {
  const data = addMealItemSchema.parse(input);
  const item = await addMealItem(data);
  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/meal/${data.mealId}`);
  return { id: item.id };
}

const updateMealItemSchema = z.object({
  id: z.uuid(),
  servings: servingsSchema,
});

type UpdateMealItemInput = z.infer<typeof updateMealItemSchema>;

export async function updateMealItemAction(input: UpdateMealItemInput) {
  const { id, servings } = updateMealItemSchema.parse(input);
  const item = await updateMealItemServings(id, servings);
  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/meal/${item.mealId}`);
  return { id: item.id };
}

const removeMealItemSchema = z.object({ id: z.uuid() });

type RemoveMealItemInput = z.infer<typeof removeMealItemSchema>;

export async function removeMealItemAction(input: RemoveMealItemInput) {
  const { id } = removeMealItemSchema.parse(input);
  const item = await removeMealItem(id);
  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/meal/${item.mealId}`);
  return { id: item.id };
}

const nutrient = z.number().min(0).max(100000);

const createFoodItemSchema = z.object({
  mealId: z.uuid(),
  name: z.string().trim().min(1).max(100),
  servingSize: z.number().positive().max(100000),
  servingUnit: z.string().trim().min(1).max(20),
  calories: nutrient,
  proteinG: nutrient,
  carbsG: nutrient,
  fatG: nutrient,
});

type CreateFoodItemInput = z.infer<typeof createFoodItemSchema>;

export async function createFoodItemAction(input: CreateFoodItemInput) {
  const { mealId, ...data } = createFoodItemSchema.parse(input);
  const food = await createFoodItem(data);
  revalidatePath(`/dashboard/meal/${mealId}`);
  return { id: food.id };
}
