import { notFound } from "next/navigation";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getMealById } from "@/data/meals";
import { MealForm } from "./meal-form";

export default async function EditMealPage({
  params,
}: {
  params: Promise<{ mealId: string }>;
}) {
  const { mealId } = await params;
  if (!z.uuid().safeParse(mealId).success) notFound();

  const meal = await getMealById(mealId);
  if (!meal) notFound();

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Edit meal</CardTitle>
          <CardDescription>Update the details of this meal.</CardDescription>
        </CardHeader>
        <CardContent>
          <MealForm
            id={meal.id}
            mealType={meal.mealType}
            eatenAt={meal.eatenAt.toISOString()}
          />
        </CardContent>
      </Card>
    </main>
  );
}
