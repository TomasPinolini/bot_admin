# Bot Admin CLI — Comprehensive MVP Plan

## Context

A 2-person team implements AI chatbot/assistant integrations for businesses. They have no structured way to track what they build, how they built it, or how to replicate successes across industries. Knowledge lives in scattered notes and memory. This tool solves that by becoming the single source of truth for clients, implementations, blueprints, and project progress — starting as a CLI, designed to evolve into a web UI.

---

## Part 1: Product (What to Build)

### Problem Statement

When a new client in a similar niche appears, the team rebuilds from scratch instead of leveraging proven patterns — wasting hours per engagement. There's no queryable record of prompts, configs, tools used, or reusable playbooks.

### Proposed Solution

**Bot Admin** is a shared terminal-based admin tool where both team members connect to a cloud database to:

- Register client companies with industry/niche metadata
- Document implementation details (tools, prompts, configs, API references)
- Track project progress through defined phases
- Distill successful implementations into reusable blueprints

### User Stories (Prioritized)

**P0 — Must Have (MVP Launch)**

| ID    | Story                                                              | Size |
| ----- | ------------------------------------------------------------------ | ---- |
| US-01 | Add a new company with industry/niche                              | S    |
| US-02 | List/search companies (by name, industry, status)                  | S    |
| US-03 | View a single company's full details                               | S    |
| US-04 | Add an implementation record to a project (tools, prompts, configs) | M    |
| US-05 | View implementation details for a project                          | S    |
| US-06 | Create a project with phases for a company                         | M    |
| US-07 | Update project status (advance phase, log entries)                 | M    |
| US-08 | View project status and progress history                           | S    |
| US-09 | Register/manage tools used across projects                         | S    |
| US-10 | Both users see same data via shared cloud DB                       | M    |

**P1 — Should Have**

| ID    | Story                                                              | Size |
| ----- | ------------------------------------------------------------------ | ---- |
| US-11 | Create a reusable blueprint from a completed project               | L    |
| US-12 | List/search blueprints by industry/niche                           | S    |
| US-13 | Apply a blueprint to a new company (pre-populate project)          | M    |
| US-14 | Edit/update existing records (companies, projects, implementations) | S    |

**P2 — Nice to Have (Later)**

| ID    | Story                                                   | Size |
| ----- | ------------------------------------------------------- | ---- |
| US-15 | Export a company's full record to JSON/Markdown          | M    |
| US-16 | Dashboard summary on startup (active projects, recent activity) | M    |
| US-17 | Archive completed/inactive companies                    | S    |
| US-18 | Add freeform notes/comments to any entity               | S    |

### Out of Scope for MVP

- Authentication / user accounts / RBAC (2 trusted users, DB-level security)
- Web UI or GUI (CLI only)
- Notifications / Slack / email integrations
- File/asset storage (text-only records)
- AI-powered features inside the tool itself
- Billing/invoicing tracking
- Offline mode / conflict resolution
- Version history / audit trail

### Success Metrics

| Metric                                       | Target                                                        |
| -------------------------------------------- | ------------------------------------------------------------- |
| Both team members using daily                | Within 1 week of launch                                       |
| First client fully documented                | Client + implementations + project tracked to completion      |
| Second client in same niche setup time       | < 30 minutes using a blueprint                                |
| Any lookup operation                         | < 3 seconds response                                          |

---

## Part 2: Architecture (How to Build It)

### Tech Stack

| Component       | Choice                         | Why                                                         |
| --------------- | ------------------------------ | ----------------------------------------------------------- |
| **Runtime**     | Node.js + TypeScript (ESM)     | Aligns with future Next.js UI migration                     |
| **CLI Framework** | Commander.js + @clack/prompts | Commander for parsing/routing, @clack for interactive prompts |
| **Database**    | Supabase (hosted PostgreSQL)   | Managed Postgres, generous free tier, dashboard for 2 users |
| **ORM**         | Drizzle ORM + drizzle-kit      | Type-safe, schema-in-TypeScript, first-class Postgres support |
| **Validation**  | Zod                            | Schema validation in services layer, reusable in web UI     |
| **IDs**         | nanoid                         | Short, URL-safe, with entity prefixes (co_, pj_, im_, etc.) |
| **Output**      | chalk + cli-table3             | Colors and formatted tables                                 |
| **Dev runner**  | tsx                            | Run TypeScript directly, no build step                      |
| **Build**       | tsup                           | Bundle to single file for bin entry                         |
| **Tests**       | vitest                         | Fast, TypeScript-native                                     |

### Data Model

```
companies                     projects                      progress_logs
 id (PK)                       id (PK)                       id (PK)
 name (unique)                 company_id (FK)               project_id (FK)
 industry                      name                          phase
 niche                         description                   status
 contact_name                  status                        note
 contact_email                 start_date                    logged_by
 contact_phone                 target_date                   logged_at
 website                       completed_date                created_at
 notes                         created_at
 status                        updated_at
 created_at                    deleted_at
 updated_at
 deleted_at

tools                         project_tools (junction)      implementation_details
 id (PK)                       id (PK)                       id (PK)
 name (unique)                 project_id (FK)               project_id (FK)
 category                      tool_id (FK)                  type (prompt|config|api_ref|note)
 url                           config_json                   title
 description                   notes                         content
 created_at                    created_at                    metadata_json
 deleted_at                                                  sort_order
                                                             created_at
                                                             updated_at
                                                             deleted_at

blueprints                    blueprint_steps               blueprint_tools (junction)
 id (PK)                       id (PK)                       id (PK)
 name (unique)                 blueprint_id (FK)             blueprint_id (FK)
 description                   step_order                    tool_id (FK)
 target_industry               title                         role_in_blueprint
 target_niche                  description                   notes
 created_at                    created_at                    created_at
 updated_at                    updated_at
 deleted_at
```

**Design decisions:**

- All IDs are text (nanoid with prefixes: `co_`, `pj_`, `im_`, `tl_`, `bp_`, etc.)
- Soft deletes via `deleted_at` on all primary entities
- Tools are a separate entity (reused across projects and blueprints)
- Implementation details are typed (prompt, config, api_ref, note) with flexible `metadata_json`
- All timestamps stored as ISO 8601 with timezone (PostgreSQL `timestamptz`)
- Projects can have multiple per company (flexible, no artificial 1:1 constraint)

### CLI Command Structure

Noun-verb with subcommands: `bot <entity> <action> [args] [--flags]`

```
bot company add [--name "Acme" --industry "healthcare" --niche "dental"]
bot company list [--industry "healthcare" --status active]
bot company show <id-or-name>
bot company edit <id> [--name "New Name"]

bot project add --company <id> [--name "AI Receptionist"]
bot project list [--company <id> --status "in_progress"]
bot project show <id>
bot project advance <id>
bot project status <id> --set "completed"
bot project assign-tool <id> --tool <tool-id>

bot tool add [--name "Voiceflow" --category "ai_platform"]
bot tool list [--category "ai_platform"]

bot impl add --project <id> --type "prompt" --title "System Prompt"
bot impl list --project <id> [--type "prompt"]
bot impl show <id>

bot progress log --project <id> --phase "build" --note "Integrated Voiceflow"
bot progress timeline <project-id>

bot blueprint add [--name "Dental AI Receptionist" --industry "healthcare"]
bot blueprint show <id>
bot blueprint add-step <bp-id> --order 1 --title "Setup"
bot blueprint add-tool <bp-id> --tool <tool-id>
bot blueprint apply <blueprint-id> --company <id>
```

Every command supports both flag mode (scriptable) and interactive mode (when flags are omitted, @clack/prompts kicks in).

### Project Structure

```
bot_admin/
├── package.json
├── tsconfig.json
├── drizzle.config.ts
├── .env.example
├── .env                          (git-ignored)
├── .gitignore
├── .gitattributes
├── drizzle/                      (generated migrations, committed)
├── .github/workflows/ci.yml
│
└── src/
    ├── index.ts                  # CLI entry point, Commander setup
    │
    ├── commands/                 # CLI command handlers
    │   ├── company.ts
    │   ├── project.ts
    │   ├── tool.ts
    │   ├── impl.ts
    │   ├── progress.ts
    │   └── blueprint.ts
    │
    ├── services/                 # Business logic (reusable by future web UI)
    │   ├── company.service.ts
    │   ├── project.service.ts
    │   ├── tool.service.ts
    │   ├── impl.service.ts
    │   ├── progress.service.ts
    │   └── blueprint.service.ts
    │
    ├── db/                       # Database layer
    │   ├── index.ts              # Drizzle client instance (lazy init)
    │   └── schema.ts             # All table definitions
    │
    ├── types/                    # Zod schemas + TypeScript types
    │   ├── company.types.ts
    │   ├── project.types.ts
    │   ├── tool.types.ts
    │   ├── impl.types.ts
    │   ├── progress.types.ts
    │   ├── blueprint.types.ts
    │   └── common.ts
    │
    ├── utils/                    # Pure utilities
    │   ├── id.ts                 # nanoid generation with prefixes
    │   ├── date.ts               # Date formatting helpers
    │   ├── config.ts             # Loads .env, validates required vars
    │   └── format.ts             # Table rendering, colors
    │
    └── ui/                       # CLI presentation (clack prompts)
        ├── prompts.ts            # Reusable interactive prompts
        └── display.ts            # Output formatting, spinners
```

**Module boundary rules (critical for future web UI reuse):**

```
commands/ -> services/ -> db/     (commands never touch db directly)
commands/ -> ui/                  (commands can use prompts/display)
services/ -> types/               (services validate with Zod)
db/ -> types/                     (schema types)
utils/ is a leaf (imported by anyone, imports nothing from above)
```

When building the Next.js web UI later:

```
Next.js API routes -> services/ -> db/    (same services, same db)
```

---

## Part 3: DevOps (How to Ship It)

### Database Setup (Supabase)

1. Create project at [supabase.com](https://supabase.com)
2. Go to **Settings > Database > Connection string (URI)**
3. Copy the connection string
4. Share credentials securely with partner (DM, not chat channel)

### Environment Variables

`.env.example` (committed):

```
# Get these from Supabase Dashboard > Settings > Database > Connection string
DATABASE_URL=your-supabase-connection-string-here
```

`.env` (git-ignored): real values, identical for both developers.

### CI/CD (GitHub Actions)

Single workflow at `.github/workflows/ci.yml`:

```yaml
name: CI
on:
  push: { branches: [main] }
  pull_request: { branches: [main] }
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: 'npm' }
      - run: npm ci
      - run: npm run typecheck
      - run: npm run build
```

### Branch Strategy

Trunk-based development on `main`. Short-lived feature branches for larger changes. Squash merge. No develop/release branches.

### Distribution

Clone and run. No npm publishing. Both developers use:

- `npm run dev -- company list` (development, via tsx)
- Optional: `npm run build && npm link` for global `bot` command

### Developer Onboarding (< 5 min)

```bash
git clone <repo-url> && cd bot_admin
npm install
cp .env.example .env    # fill with shared Supabase credentials
npm run db:migrate
npm run dev -- company list   # verify it works
```

### Windows Considerations

- `.gitattributes`: `* text=auto eol=lf`
- Use `tsx` (works identically on Windows)
- All paths use forward slashes in code
- `dotenv` handles `.env` loading cross-platform

---

## Part 4: Implementation Slices (Build Order)

Each slice delivers end-to-end value and can be tested independently.

### Slice 0: Foundation

- package.json, tsconfig.json, .gitignore, .gitattributes, .env.example
- Install all dependencies
- drizzle.config.ts
- src/db/schema.ts (all tables)
- src/db/index.ts (client connection, lazy init)
- src/utils/ (config, id, date, format)
- src/ui/ (prompts, display)
- src/types/common.ts (shared enums)
- src/index.ts (Commander skeleton with help)
- **Verify:** `npm run dev -- --help` shows commands

### Slice 1: Company Management

- src/types/company.types.ts (Zod schemas)
- src/services/company.service.ts (CRUD)
- src/commands/company.ts (add, list, show, edit)
- **Verify:** `bot company add`, `bot company list`, `bot company show <id>`

### Slice 2: Tool Registry

- src/types/tool.types.ts
- src/services/tool.service.ts
- src/commands/tool.ts (add, list, show)
- **Verify:** `bot tool add --name "Voiceflow"`, `bot tool list`

### Slice 3: Projects + Tools Assignment

- src/types/project.types.ts
- src/services/project.service.ts
- src/commands/project.ts (add, list, show, advance, status, assign-tool)
- Project-tool junction (assign tools to projects)
- **Verify:** Create project, assign tools, advance phases

### Slice 4: Implementation Details

- src/types/impl.types.ts
- src/services/impl.service.ts
- src/commands/impl.ts (add, list, show)
- Typed content: prompts, configs, API refs, notes
- **Verify:** `bot impl add --project <id> --type prompt --title "System Prompt"`

### Slice 5: Progress Tracking

- src/types/progress.types.ts
- src/services/progress.service.ts
- src/commands/progress.ts (log, timeline)
- Phase-based logging with status
- **Verify:** `bot progress log --project <id> --phase build --note "..."`

### Slice 6: Blueprints

- src/types/blueprint.types.ts
- src/services/blueprint.service.ts
- src/commands/blueprint.ts (add, list, show, add-step, add-tool, apply)
- Blueprint steps, blueprint-tool junctions
- Apply command: creates project + pre-populates from blueprint
- **Verify:** Create blueprint, apply to new company, see pre-filled project

### Slice 7: CI + Polish

- .github/workflows/ci.yml
- README.md with onboarding instructions
- Error messages polish, help text review

---

## Verification Plan

After each slice, verify with these commands:

```bash
# Foundation
npm run dev -- --help

# Companies
npm run dev -- company add --name "Test Dental" --industry "healthcare" --niche "dental"
npm run dev -- company list
npm run dev -- company show <id>

# Tools
npm run dev -- tool add --name "OpenAI API" --category "ai_platform"
npm run dev -- tool list

# Projects
npm run dev -- project add --company <id> --name "AI Receptionist"
npm run dev -- project show <id>
npm run dev -- project advance <id>

# Implementations
npm run dev -- impl add --project <id> --type prompt --title "System Prompt" --content "You are a dental assistant..."
npm run dev -- impl list --project <id>

# Progress
npm run dev -- progress log --project <id> --phase build --note "Completed initial setup"
npm run dev -- progress timeline <id>

# Blueprints
npm run dev -- blueprint add --name "Dental Reception Bot" --industry "healthcare" --niche "dental"
npm run dev -- blueprint apply <bp-id> --company <new-company-id>
```

Both team members should run the full flow on the shared database to verify real-time sync.
