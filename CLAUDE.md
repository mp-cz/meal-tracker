# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Status

Freshly bootstrapped from Create Next App; no meal-tracking features exist yet. Only the default `src/app/layout.tsx`, `page.tsx` and `globals.css` are present.

## Commands

- `npm run dev` — dev server at http://localhost:3000
- `npm run build` / `npm start` — production build / serve
- `npm run lint` — ESLint (flat config in `eslint.config.mjs`, uses `eslint-config-next`)
- No test runner is configured.

## Stack

- Next.js 16 (App Router, under `src/app/`), React 19, TypeScript, Tailwind CSS v4 (via `@tailwindcss/postcss`; styles in `src/app/globals.css`).
- Path alias: `@/*` → `./src/*`.
- Next 16 and React 19 differ from older versions; check `node_modules/next/dist/docs/` or the official docs rather than relying on memory of older APIs.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
