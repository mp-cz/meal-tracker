import { TZDate } from "@date-fns/tz";
import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";
import { cookies } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getAvailableFoodItems } from "@/data/food-items";
import { getMealById } from "@/data/meals";
import { resolveTimeZone } from "@/lib/timezone";
import { MealForm } from "./meal-form";
import { MealItems } from "./meal-items";

export default async function EditMealPage({
  params,
}: {
  params: Promise<{ mealId: string }>;
}) {
  const { mealId } = await params;
  if (!z.uuid().safeParse(mealId).success) notFound();

  const meal = await getMealById(mealId);
  if (!meal) notFound();

  const foods = await getAvailableFoodItems();
  const timeZone = resolveTimeZone((await cookies()).get("tz")?.value);
  const mealDay = format(new TZDate(meal.eatenAt, timeZone), "yyyy-MM-dd");

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-6">
      <Button
        variant="ghost"
        className="self-start"
        render={<Link href={`/dashboard?date=${mealDay}`} />}
      >
        <ArrowLeft />
        Back to dashboard
      </Button>

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

      <Card>
        <CardHeader>
          <CardTitle>Food items</CardTitle>
          <CardDescription>Log what you ate in this meal.</CardDescription>
        </CardHeader>
        <CardContent>
          <MealItems mealId={meal.id} items={meal.items} foods={foods} />
        </CardContent>
      </Card>
    </main>
  );
}
