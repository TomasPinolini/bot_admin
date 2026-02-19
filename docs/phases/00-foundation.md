# Phase 0: Foundation

**Goal:** Establish the project skeleton so every future slice drops into a working structure.

## What Was Built

| Area | Files | Purpose |
|------|-------|---------|
| Config | `package.json`, `tsconfig.json`, `.gitignore`, `.gitattributes`, `.env.example` | Project metadata, TypeScript ESM config, git hygiene |
| Database | `drizzle.config.ts`, `src/db/schema.ts`, `src/db/index.ts` | Full PostgreSQL schema (10 tables), lazy Drizzle client via Supabase |
| Utilities | `src/utils/config.ts` | Loads `.env`, validates `DATABASE_URL`, exits with helpful message if missing |
| | `src/utils/id.ts` | `generateId(entity)` — nanoid with prefixes (`co_`, `pj_`, `tl_`, `im_`, `pg_`, `bp_`, etc.) |
| | `src/utils/date.ts` | `formatDate()`, `formatDateTime()`, `nowISO()` |
| | `src/utils/format.ts` | `heading()`, `success()`, `warn()`, `error()`, `label()`, `createTable()`, `noResults()` using chalk + cli-table3 |
| UI | `src/ui/prompts.ts` | Reusable @clack/prompts wrappers: `textInput()`, `selectInput()`, `confirmInput()` — all handle cancellation gracefully |
| | `src/ui/display.ts` | `withSpinner()` — wraps async operations with a loading indicator |
| Types | `src/types/common.ts` | Shared Zod enums: `statusEnum`, `projectStatusEnum`, `projectPhaseEnum`, `implTypeEnum`, `toolCategoryEnum` |
| CLI | `src/index.ts` | Commander.js program with all 6 subcommand groups registered |

## Database Schema

10 tables across 3 domains:

**Core entities:** `companies`, `tools`, `projects`
**Detail entities:** `implementation_details`, `progress_logs`
**Blueprint entities:** `blueprints`, `blueprint_steps`, `blueprint_tools`
**Junction tables:** `project_tools`

All primary entities use soft deletes (`deleted_at` column). All IDs are prefixed nanoid strings.

## Architecture Decisions

- **Lazy DB initialization** — the database connection is only created when the first query runs, so `--help` works without credentials
- **Proxy-based `db` export** — services import `db` as a normal object but it's a Proxy that lazily initializes on first property access
- **Module boundaries** — `commands/ -> services/ -> db/` (commands never touch db directly). This enables future web UI to reuse the services layer directly

## How to Verify

```bash
npm run dev -- --help
# Should show: company, tool, project, impl, progress, blueprint subcommands

npm run dev -- company --help
# Should show: add, list, show, edit actions

npx tsc --noEmit
# Should pass with zero errors
```
