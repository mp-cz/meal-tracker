import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { DatePicker } from "./date-picker";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export default async function DashboardPage({ searchParams }: PageProps<"/dashboard">) {
  const { userId, redirectToSignIn } = await auth();
  if (!userId) return redirectToSignIn();

  const raw = (await searchParams).date;
  const param = typeof raw === "string" && DATE_RE.test(raw) ? raw : null;
  const start = param ? new Date(`${param}T00:00:00Z`) : null;
  const valid = start && !Number.isNaN(start.getTime());
  const date = valid ? param : null;

  // Days are UTC-based. Until the client sets ?date=, nothing is queried.
  const dayMeals = valid
    ? await db.query.meals.findMany({
        where: {
          userId,
          eatenAt: { gte: start, lt: new Date(start.getTime() + 86_400_000) },
        },
        with: { items: { with: { foodItem: true } } },
        orderBy: { eatenAt: "asc" },
      })
    : [];

  return (
    <main className="mx-auto w-full max-w-3xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <DatePicker date={date} />
      </div>

      {dayMeals.length === 0 ? (
        <p className="text-muted-foreground">No meals logged for this date.</p>
      ) : (
        <ul className="space-y-4">
          {dayMeals.map((meal) => (
            <li key={meal.id} className="rounded-lg border p-4">
              <div className="flex justify-between font-medium">
                <span className="capitalize">{meal.mealType}</span>
                <span className="text-sm text-muted-foreground">
                  {meal.eatenAt.toLocaleTimeString("en-GB", {
                    hour: "2-digit",
                    minute: "2-digit",
                    timeZone: "UTC",
                  })}
                </span>
              </div>
              <ul className="mt-2 space-y-1 text-sm">
                {meal.items.map((item) => (
                  <li key={item.id} className="flex justify-between">
                    <span>
                      {item.foodItem.name} × {item.servings}
                    </span>
                    <span>{Math.round(Number(item.calories))} kcal</span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
