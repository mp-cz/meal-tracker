import { addDays, format, isValid, parse, startOfDay } from "date-fns";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getMealsForDay } from "@/data/meals";
import { DatePicker } from "./date-picker";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { date: dateParam } = await searchParams;
  const parsed =
    typeof dateParam === "string"
      ? parse(dateParam, "yyyy-MM-dd", new Date())
      : null;
  const date = parsed && isValid(parsed) ? startOfDay(parsed) : startOfDay(new Date());

  const meals = await getMealsForDay(date, addDays(date, 1));

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <DatePicker date={date} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Meals</CardTitle>
          <CardDescription>{format(date, "EEEE, MMMM d, yyyy")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {meals.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No meals logged for this day.
            </p>
          )}
          {meals.map((meal) => {
            const calories = meal.items.reduce(
              (sum, item) => sum + Number(item.calories),
              0,
            );
            return (
              <Card key={meal.id} size="sm">
                <CardContent className="flex items-center justify-between gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="font-medium">
                      {meal.items.map((i) => i.foodItem.name).join(", ") ||
                        "No items"}
                    </span>
                    <Badge variant="secondary" className="capitalize">
                      {meal.mealType}
                    </Badge>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(calories)} kcal
                  </span>
                </CardContent>
              </Card>
            );
          })}
        </CardContent>
      </Card>
    </main>
  );
}
