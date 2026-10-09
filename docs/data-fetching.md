# Data Fetching Standards

These rules apply to all data fetching in this project, without exception.

## Core rule: Server Components only

- **All data fetching must be done via Server Components.**
- **Under absolutely no circumstances may route handlers (`route.ts`) be created to fetch data.** Do not add `src/app/api/**` endpoints for reading data.
- Do not fetch data from Client Components (no `useEffect` + `fetch`, no SWR/React Query against internal endpoints). If a Client Component needs data, fetch it in a Server Component and pass it down as props.

## Database access: `/data` helpers only

- All database queries must be performed through helper functions in the `src/data/` directory (e.g. `src/data/meals.ts`).
- Server Components call these helpers; they never import `db` or run queries directly.
- Group helpers by entity (one file per area, e.g. `meals.ts`, `food-items.ts`).
- Helpers must be server-only. Add `import "server-only";` at the top of each file.

## Drizzle ORM only: no raw SQL

- Helper functions must use **Drizzle ORM** to query the database (`db` from `@/db`, tables from `@/db/schema`).
- **DO NOT USE RAW SQL.** No `db.execute(sql\`...\`)` for queries, no raw query strings, no other database clients.
- Use Drizzle's query builder or relational queries (`db.query.*`) with operators such as `eq`, `and`, `gte`, `lt` from `drizzle-orm`.

## User data isolation (CRITICAL)

A logged-in user must only be able to access their own data. They must never be able to access any other user's data.

- Every helper that reads user-owned data must get the user id from Clerk's server-side `auth()` **inside the helper** and filter by it (`eq(table.userId, userId)`).
- **Never accept a `userId` as a parameter from the caller, URL, search params, or form input.** The identity always comes from the session.
- If there is no authenticated user, throw or return no data; never fall back to unfiltered queries.
- Lookups by id (e.g. a meal by `id`) must also include the user filter: `and(eq(meals.id, id), eq(meals.userId, userId))`. An id alone is never sufficient.
- Joined or related data must also be constrained to the user's own rows.
- `food_items.userId` may be `null` for shared catalog foods. Helpers may return those in addition to the user's own foods, but must never return another user's foods.

## Example

```ts
// src/data/meals.ts
import "server-only";
import { auth } from "@clerk/nextjs/server";
import { and, eq, gte, lt } from "drizzle-orm";
import { db } from "@/db";
import { meals } from "@/db/schema";

export async function getMealsForDay(start: Date, end: Date) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  return db
    .select()
    .from(meals)
    .where(
      and(
        eq(meals.userId, userId),
        gte(meals.eatenAt, start),
        lt(meals.eatenAt, end),
      ),
    );
}
```

```tsx
// src/app/dashboard/page.tsx (Server Component)
import { getMealsForDay } from "@/data/meals";

export default async function DashboardPage() {
  const meals = await getMealsForDay(start, end);
  // render with shadcn/ui components (see docs/ui.md)
}
```
