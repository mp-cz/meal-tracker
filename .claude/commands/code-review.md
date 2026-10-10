---
description: In-depth code review of the codebase, focused on security and logical bugs
---

Perform an in-depth code review of this codebase. Prioritize security vulnerabilities and logical bugs over style or refactoring.

## Before you start
- Read `CLAUDE.md` and every relevant file in `/docs`. Review against the standards they define, and flag any violation (e.g. raw SQL, route handlers for data, custom UI components, user ids taken from input).
- Read the code itself. Don't skim or guess. Cite findings as `file_path:line_number`.
- This is Next.js 16 / React 19. Check `node_modules/next/dist/docs/` before calling something a bug in framework behavior.

## Security
- Authentication and authorization: every data helper and Server Action must get the user id from `await auth()` and filter by it. Check for missing ownership checks, IDOR, and joins or related rows that leak another user's data.
- Route protection: proxy matcher gaps, and routes or actions reachable without a session.
- Input validation: Server Action params validated with Zod, with sensible bounds. Check search params and cookies too.
- Data exposure: server-only code reachable from client bundles, secrets in code or git, env handling.
- Abuse: unbounded writes, missing rate limits, expensive queries driven by user input.
- Dependencies: known vulnerabilities (`npm audit`) and risky version ranges.

## Logical bugs
- Date and timezone handling (server vs. browser, DST, day boundaries).
- Off-by-one and range errors, null/undefined handling, numeric precision (`numeric` returned as strings).
- Race conditions, non-atomic multi-step writes, missing transactions.
- Stale data: caching and revalidation after mutations.
- Error handling: swallowed errors, wrong status paths, failures that leave the UI in a bad state.
- Schema issues: constraints, cascade behavior, indexes that don't match the queries.

## How to report
- Trace each finding to a concrete failure scenario (specific inputs and state, then the wrong outcome). Drop anything you can't demonstrate from the code.
- Rank by severity (high, medium, low), and separate real bugs from latent risks that only matter once planned features land.
- Give a short, specific fix for each finding.
- Note what is done well, so it isn't "fixed" by accident.
- Don't change any code. Report only, and wait for approval before fixing.
