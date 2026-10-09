# Authentication Standards

These rules apply to everything related to authentication and identity in this project, without exception.

## Core rule: Clerk only

- **Authentication is handled exclusively by [Clerk](https://clerk.com)** via `@clerk/nextjs`.
- Do not add any other auth library, custom session/cookie/JWT handling, password storage, or hand-rolled login logic (no NextAuth/Auth.js, Lucia, Supabase Auth, etc.).
- Do not create a local `users` table. Tables store the Clerk user id in a `user_id` text column (see `src/db/schema.ts`).
- Clerk's Next.js APIs may differ from what you remember. Check the Clerk docs (or the `clerk-*` skills) before writing auth code.

## Setup (already in place; do not duplicate)

- `<ClerkProvider>` wraps the app in `src/app/layout.tsx`. Do not add a second provider.
- `src/proxy.ts` runs `clerkMiddleware()` (Next 16 uses `proxy.ts`, not `middleware.ts`). Do not create a `middleware.ts`.
- Sign-in and sign-up live at `src/app/sign-in/[[...sign-in]]/page.tsx` and `src/app/sign-up/[[...sign-up]]/page.tsx` and render Clerk's `<SignIn />` / `<SignUp />`.
- Configuration comes from environment variables in `.env.local`:
  - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`
  - `NEXT_PUBLIC_CLERK_SIGN_IN_URL`, `NEXT_PUBLIC_CLERK_SIGN_UP_URL`
  - `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL`, `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL`
- Never hard-code, log, or commit Clerk keys. `CLERK_SECRET_KEY` must never be exposed to the client (no `NEXT_PUBLIC_` prefix).

## Getting the current user

- **Server side (Server Components, `src/data/` helpers, Server Actions):** use `auth()` from `@clerk/nextjs/server`. It is async, so always `await` it.

  ```ts
  import { auth } from "@clerk/nextjs/server";

  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  ```

- Use `currentUser()` from `@clerk/nextjs/server` only when you need profile fields (name, email, avatar). Prefer `auth()` when only the id is needed.
- **Client side:** use Clerk's hooks (`useUser`, `useAuth`) only for UI concerns, never to fetch or authorize data.
- The user id **always** comes from the Clerk session. Never accept it from a parameter, URL, search param, form field, or request body (see `docs/data-fetching.md`).

## Protecting routes

- Pages that show user data (e.g. `/dashboard`) must require a signed-in user. Protect them in `src/proxy.ts` with `createRouteMatcher` and `auth.protect()`:

  ```ts
  import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

  const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

  export default clerkMiddleware(async (auth, req) => {
    if (isProtectedRoute(req)) await auth.protect();
  });
  ```

- Route protection is **not** a substitute for authorization. Every data helper must still call `auth()` and filter by `userId` itself.
- Signed-out users who visit a protected route are redirected to sign-in by Clerk.

## Auth UI

- Use Clerk's prebuilt components: `<SignIn />`, `<SignUp />`, `<SignInButton />`, `<SignUpButton />`, `<UserButton />`, and `<Show when="signed-in" | "signed-out">` for conditional rendering.
- Do not build custom sign-in/sign-up forms. All other UI rules in `docs/ui.md` still apply to the surrounding page.
- Conditional rendering with `<Show>` only hides UI. It is never a security boundary.

## Do / Don't

- Do call `await auth()` inside each data helper and Server Action that touches user data.
- Do treat a missing `userId` as unauthorized: throw or return nothing.
- Don't read `userId` from `searchParams`, `params`, cookies you set yourself, or request bodies.
- Don't create `route.ts` handlers for auth or user data. Clerk's components and middleware cover what is needed.
- Don't store passwords, tokens, or sessions in the database.
- Don't trust client-side checks (`useUser`, `<Show>`) for authorization.
