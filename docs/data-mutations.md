# Data Mutation Standards

These rules apply to every data mutation (insert, update, delete) in this project, without exception. For reading data see `docs/data-fetching.md`; for identity see `docs/auth.md`.

## Core rule: Server Actions + `/data` helpers

- **All mutations are performed by Server Actions**, which call mutation helpers in `src/data/`.
- Do not mutate data from route handlers (`route.ts`), Client Components, Server Components during render, or directly from `db` anywhere outside `src/data/`.
- Flow: Client/Server Component → Server Action (`actions.ts`) → helper in `src/data/` → Drizzle.

## Database access: `/data` helpers only, Drizzle only

- Every database write lives in a helper function in `src/data/`, grouped by entity (e.g. `src/data/meals.ts`), alongside the read helpers.
- Helpers must start the file with `import "server-only";`.
- Helpers wrap **Drizzle ORM** calls (`db.insert`, `db.update`, `db.delete` with `db` from `@/db` and tables from `@/db/schema`).
- **DO NOT USE RAW SQL.** No `db.execute(sql\`...\`)` for writes, no other database clients.
- Use `db.transaction` when a mutation touches multiple rows or tables that must succeed or fail together (e.g. a meal and its meal items).

## Server Actions live in co-located `actions.ts` files

- Server Actions go in a file named **`actions.ts`** placed next to the route that uses them (e.g. `src/app/dashboard/actions.ts`).
- Every `actions.ts` starts with the `"use server"` directive.
- Do not define inline Server Actions inside components, and do not put them anywhere other than a co-located `actions.ts`.
- Actions are thin: validate, call a `src/data/` helper, revalidate. No Drizzle or business logic inside the action.
- Export only async action functions from `actions.ts` (Zod schemas and types stay unexported or live in a non-`"use server"` file).

## Parameters: explicit types, no `FormData`

- **Every parameter of a Server Action must have an explicit TypeScript type.** No implicit `any`, no untyped destructuring.
- **Do not use `FormData`** as a parameter type or accept it in any form. Pass plain, typed objects or values instead, and call actions from event handlers or `useTransition`, not as `<form action>`.
- Infer the type from the Zod schema so the type and validation cannot drift:

  ```ts
  type CreateMealInput = z.infer<typeof createMealSchema>;
  ```

- Use serializable types only (strings, numbers, booleans, plain objects, arrays). Pass dates as ISO strings or `Date` and validate them with Zod (`z.coerce.date()` or `z.iso.datetime()`).

## Validation: Zod on every action

- **Every Server Action must validate its arguments with [Zod](https://zod.dev)** before doing anything else. TypeScript types are not runtime guarantees; the client can send anything.
- Use `schema.parse(...)` (throws) or `schema.safeParse(...)` and return a typed error result. Never skip validation for "simple" actions, including a bare `id`: use `z.uuid()`.
- Validate the whole input. Do not use `z.any()` or loosen schemas to make types pass.
- Zod 4 is installed (`zod`). Import it as `import { z } from "zod"`.

## Authorization

- Actions never accept a `userId`. The identity comes from Clerk's `await auth()` **inside the `src/data/` helper**, exactly as for reads.
- Updates and deletes must filter by both the row id **and** the user: `and(eq(meals.id, id), eq(meals.userId, userId))`. An id alone is never sufficient.
- When inserting, set `userId` from the session, never from input.
- If there is no authenticated user, throw. Never fall back to an unfiltered write.
- When a mutation references another row by id (e.g. a `foodItemId`), confirm it is the user's own or a shared (`userId` null) row before using it.

## After mutating

- Call `revalidatePath(...)` (or `revalidateTag`) from `next/cache` in the action so Server Components show fresh data.
- Return a small serializable result (e.g. the new id or `{ success: true }`), not raw database rows with unvalidated shapes.

## Example

```ts
// src/data/meals.ts
import "server-only";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { meals } from "@/db/schema";

export async function createMeal(data: {
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  eatenAt: Date;
}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const [meal] = await db
    .insert(meals)
    .values({ userId, mealType: data.mealType, eatenAt: data.eatenAt })
    .returning({ id: meals.id });
  return meal;
}

export async function deleteMeal(id: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await db.delete(meals).where(and(eq(meals.id, id), eq(meals.userId, userId)));
}
```

```ts
// src/app/dashboard/actions.ts
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
```

## Checklist before committing mutation code

- [ ] The write lives in a `src/data/` helper using Drizzle (no raw SQL).
- [ ] The helper calls `auth()` itself and scopes by `userId`; no `userId` parameter.
- [ ] The action is in a co-located `actions.ts` with `"use server"`.
- [ ] Every action parameter has an explicit type and none is `FormData`.
- [ ] Every action validates its input with Zod before calling the helper.
- [ ] The action revalidates affected paths.
