import { TZDate } from "@date-fns/tz";
import { addDays, format, isValid, parse, startOfDay } from "date-fns";
import { cookies } from "next/headers";

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

// The browser stores its IANA timezone in the "tz" cookie (see date-picker.tsx)
// so day boundaries are computed in the user's zone, not the server's.
function resolveTimeZone(value: string | undefined) {
  if (!value) return "UTC";
  try {
    new Intl.DateTimeFormat(undefined, { timeZone: value });
    return value;
  } catch {
    return "UTC";
  }
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { date: dateParam } = await searchParams;
  const timeZone = resolveTimeZone((await cookies()).get("tz")?.value);
  const now = new TZDate(new Date(), timeZone);
  const parsed =
    typeof dateParam === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)
      ? parse(dateParam, "yyyy-MM-dd", now)
      : null;
  const date = startOfDay(parsed && isValid(parsed) ? parsed : now);

  const meals = await getMealsForDay(date, addDays(date, 1));

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <DatePicker dateKey={format(date, "yyyy-MM-dd")} />
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
