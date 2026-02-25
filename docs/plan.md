# Bot Admin — Project Plan

## Context

A 2-person team implements AI chatbot/assistant integrations for businesses.
They have no structured way to track what they build, how they built it, or how to replicate successes across industries.
Knowledge lives in scattered notes and memory.

**Bot Admin** is the single source of truth for clients, implementations, blueprints, and project progress — started as a CLI, now evolving into a full web platform with AI-powered automation.

**Current pain points the roadmap addresses:**
- After every client meeting recorded on Fireflies.ai, the developer manually reads notes, creates company records, and types in project details (15-30 min per meeting, error-prone)
- No way to discover that a similar project was completed months ago for a company in the same niche
- No connection to external data sources — company profiles contain only what the developer remembers to type
- No financial visibility — no tracking of costs per project, per tool, or per client

**Goal**: Build an AI pipeline that transforms Fireflies meeting recordings into fully hydrated company profiles and intelligently pre-populated projects — with AI-powered meeting preparation, company investigation, and full cost/revenue tracking for project profitability.

---

## What's Built (Completed)

### CLI MVP (Slices 0-6) — Done

| Slice | Name | Status |
|:-----:|:-----|:------:|
| 0 | Foundation (package.json, schema, utils, types) | Done |
| 1 | Company Management (add, list, show, edit) | Done |
| 2 | Tool Registry (add, list, show) | Done |
| 3 | Projects + Tool Assignment (add, list, show, advance, assign) | Done |
| 4 | Implementation Details (add, list, show) | Done |
| 5 | Progress Tracking (log, timeline) | Done |
| 6 | Blueprints (add, show, add-step, add-tool, apply) | Done |
| 7 | CI + Polish | Done |

CLI pattern: `bot <entity> <action> [args] [--flags]` — supports both flag mode (scriptable) and interactive mode (@clack/prompts).

### Web Frontend — Done

- Next.js 16 App Router with dashboard layout
- All CRUD operations for companies, projects, tools, blueprints
- Business catalog management (industries, niches, products, services)
- Company-to-catalog assignments
- Dashboard with analytics
- Design system from Pencil

### Normalized Business Catalog — Done

Industries, niches, products, and services as separate entities with company junction tables.

---

## Tech Stack

| Component | Choice | Why |
|:----------|:-------|:----|
| **Runtime** | Node.js + TypeScript (ESM) | Shared across CLI, web, and Trigger.dev tasks |
| **CLI** | Commander.js + @clack/prompts | Flag mode + interactive prompts |
| **Web** | Next.js 16 (App Router) | Server components, server actions, Vercel deployment |
| **Database** | Supabase (hosted PostgreSQL) | Managed Postgres, pgvector support, generous free tier |
| **ORM** | Drizzle ORM + drizzle-kit | Type-safe, schema-in-TypeScript, first-class Postgres |
| **Background Jobs** | Trigger.dev v3 | Long-running tasks, retry, observability, cron scheduling |
| **AI Extraction** | Claude API (Anthropic) | Structured output via `tool_use`, reliable entity extraction |
| **Embeddings** | OpenAI `text-embedding-3-small` | 1536 dimensions, best cost/quality for semantic search |
| **Validation** | Zod | Schema validation, shared across CLI and web |
| **IDs** | nanoid with entity prefixes | Short, URL-safe (`co_`, `pj_`, `mt_`, etc.) |
| **Build** | tsup (CLI), Next.js (web) | Bundle CLI to single file, Next.js handles web |
| **Tests** | vitest | Fast, TypeScript-native |

---

## Data Model

### Existing Tables (Built)

```
companies                   projects                    progress_logs
────────────────────        ────────────────────        ────────────────────
 id          PK              id          PK              id          PK
 name        unique          company_id  FK→companies    project_id  FK→projects
 contact_name                name                        phase
 contact_email               description                 status
 contact_phone               status                      note
 website                     start_date                  logged_by
 notes                       target_date                 logged_at
 status                      completed_date              created_at
 created_at                  created_at
 updated_at                  updated_at
 deleted_at                  deleted_at

tools                       project_tools (junction)    implementation_details
────────────────────        ────────────────────        ────────────────────
 id          PK              id          PK              id          PK
 name        unique          project_id  FK→projects     project_id  FK→projects
 category                    tool_id     FK→tools        type (prompt|config|api_ref|note)
 url                         config_json                 title
 description                 notes                       content
 created_at                  created_at                  metadata_json
 deleted_at                                              sort_order
                                                         created_at / updated_at / deleted_at

blueprints                  blueprint_steps             blueprint_tools (junction)
────────────────────        ────────────────────        ────────────────────
 id          PK              id          PK              id          PK
 name        unique          blueprint_id FK→blueprints  blueprint_id FK→blueprints
 description                 step_order                  tool_id     FK→tools
 created_at                  title                       role_in_blueprint
 updated_at                  description                 notes
 deleted_at                  created_at / updated_at     created_at

industries / niches / products / services    company_* junction tables
────────────────────────────────────────     ────────────────────────────
 id, name, description, created_at,          company_industries, company_niches,
 deleted_at (niches have industry_id FK)     company_products, company_services
                                             + blueprint_industries, blueprint_niches
```

### New Tables (Roadmap)

See [Schema Changes](#schema-changes) section below for full definitions of tables added in each phase.

### Design Decisions

- **IDs** — text (nanoid with prefixes: `co_`, `pj_`, `tl_`, `bp_`, `mt_`, `sm_`, `ex_`, etc.)
- **Soft deletes** — `deleted_at` on all primary entities
- **Tools** — separate entity, reused across projects, blueprints, and expense tracking
- **Implementation details** — typed (`prompt`, `config`, `api_ref`, `note`) with flexible `metadata_json`
- **Timestamps** — ISO 8601 with timezone (PostgreSQL `timestamptz`)
- **Projects** — multiple per company (no artificial 1:1 constraint)

---

## Project Structure

```
bot_admin/
├── docs/plan.md                          # This file — single source of truth
├── package.json                          # CLI + Trigger.dev dependencies
├── tsconfig.json
├── drizzle.config.ts
├── trigger.config.ts                     # Trigger.dev v3 config
├── .env.example
├── drizzle/                              # Generated migrations (committed)
│
├── src/                                  # CLI + Trigger.dev tasks
│   ├── index.ts                          # CLI entry point (Commander)
│   ├── commands/                         # CLI command handlers
│   ├── services/                         # Business logic (shared by CLI + web)
│   ├── db/                               # Drizzle client + schema (CLI copy)
│   ├── types/                            # Zod schemas + TypeScript types
│   ├── utils/                            # Pure utilities (id, date, format)
│   ├── ui/                               # CLI presentation (clack prompts)
│   └── trigger/                          # Trigger.dev background tasks
│       ├── sync-fireflies.ts             # Scheduled: poll Fireflies every 15 min
│       ├── extract-meeting.ts            # Claude extraction per meeting
│       ├── investigate-company.ts        # Web scraping + brief generation
│       ├── generate-interview-guide.ts   # Claude interview guide (Phase 1.5)
│       ├── generate-embedding.ts         # OpenAI embedding generation
│       └── lib/                          # Shared task utilities
│
└── web/                                  # Next.js web frontend
    └── src/
        ├── app/(dashboard)/              # Dashboard pages
        ├── components/                   # React components
        └── lib/                          # Schema, queries, actions, db, ids
```

### Module Boundary Rules

```
CLI:  commands/ → services/ → db/         (commands never touch db directly)
Web:  app/ → lib/actions.ts → lib/db.ts   (server actions with Drizzle)
Both: services/ share the same Zod types and validation logic
```

---

## Roadmap: AI Pipeline & New Features

### Solution Overview

```
PRE-MEETING FLOW:
  Developer schedules meeting (in-app or via Google Calendar → auto-synced)
  → Links to company (auto if created in-app, manual if imported from calendar)
  → Auto-triggers Company Investigation (web scraping + enrichment)
  → AI generates tailored interview guide (smart questions, knowledge gaps, topics)
  → Developer reviews preparation materials before meeting

MEETING FLOW:
  Fireflies records meeting
  → Trigger.dev polls for completed transcript (every 15 min)
  → System matches transcript to scheduled meeting (company + date + title similarity)
  → Claude AI extracts company info + catalog entities + meeting details
  → Developer reviews everything on a dedicated review page
  → Confirms/edits/rejects each field before any DB write

POST-MEETING FLOW:
  → Investigation results shown as suggestions — developer approves individually
  → When creating a project, AI finds similar past projects via pgvector
  → Developer picks/adapts a blueprint or starts fresh
  → Completed projects get outcome ratings that feed back into matching

FINANCIAL TRACKING:
  → Log expenses (subscriptions + one-time) with project allocation
  → Record revenue/payments per project
  → View profitability per project, per client, per tool
```

**Key principle**: No silent writes. Every AI-generated change requires explicit user confirmation.

### Phasing & Prioritization (ICE Scoring)

| Phase | Impact | Confidence | Ease | ICE Score | Effort |
|---|:---:|:---:|:---:|:---:|---|
| **Phase 0: Infrastructure** | 8 | 10 | 7 | 560 | Done |
| **Phase 1: Fireflies + AI Extraction** | 9 | 8 | 6 | 432 | Done |
| **Phase 1.5: Meeting Preparation + Google Calendar** | 8 | 8 | 5 | 320 | ~11-13 days |
| **Phase 2: Company Investigation** | 7 | 6 | 4 | 168 | ~6 days |
| **Phase 3: Blueprint Matching & Reuse** | 8 | 7 | 5 | 280 | ~5 days |
| **Phase 4: Cost & Revenue Management** | 7 | 9 | 7 | 441 | ~5-6 days |

**Build order**: Phase 0 → Phase 1 → Phase 1.5 → Phase 2 → Phase 3 → Phase 4

> **Note on Phase 1.5**: Positioned after Fireflies import because it reuses the `meetings` table
> and Company Investigation infrastructure. Phase 2 remains separate because investigation can be
> triggered both from meeting preparation (auto) and from the company page (manual).

> **Note on Phase 4**: Cost & Revenue Management is fully independent of the AI pipeline. It can be
> built in parallel with any phase, or even first if financial tracking is the immediate priority.
> Reordering is trivial since it has zero dependencies on other phases.

---

## Architecture Decisions

### ADR-001: AI Provider — Claude API (Anthropic)

**Decision**: Use Claude API (`claude-sonnet-4-20250514`) for entity extraction from meeting transcripts.

**Why**: Native `tool_use` with JSON schemas produces reliable structured output. The `@anthropic-ai/sdk` works cleanly in Trigger.dev's Node.js runtime. Extraction is a one-shot structured task which plays to Claude's instruction-following strength. Cost is comparable to OpenAI at this volume (~$0.05 per transcript analysis).

**Consequence**: New env var `ANTHROPIC_API_KEY`, new dep `@anthropic-ai/sdk` in root `package.json`.

### ADR-002: Fireflies Sync — Polling via Trigger.dev

**Decision**: Poll Fireflies GraphQL API every 15 minutes via a Trigger.dev `schedules.task()` instead of using webhooks.

**Why**: Webhooks require a stable public endpoint and verification logic. Polling every 15 min is more than sufficient for meeting cadence (a few per day). Trigger.dev provides built-in cron scheduling with retry, logging, and observability. The task stores a watermark (most recent meeting date) and fetches only newer transcripts.

**Consequence**: Up to 15 min delay between meeting completion and import — acceptable.

### ADR-003: Background Tasks — Trigger.dev (not Supabase Edge Functions)

**Decision**: Use Trigger.dev v3 for all background tasks (Fireflies polling, Claude extraction, web scraping, embedding generation).

**Why**: Already configured in the project (`trigger.config.ts`). Supports long-running tasks (up to 3600s configured). Tasks share the same TypeScript codebase, Drizzle ORM schemas, and database connection. Built-in retry with exponential backoff. Dashboard provides observability.

**Consequence**: All background tasks go in `src/trigger/`. Web app triggers tasks via `tasks.trigger()` using `TRIGGER_SECRET_KEY`.

### ADR-004: Semantic Matching — pgvector on Supabase

**Decision**: Use pgvector extension on Supabase for storing and searching project embeddings.

**Why**: Supabase natively supports pgvector. Keeps all data in a single database. At expected scale (hundreds of projects), pgvector with HNSW index is performant. Embeddings generated via OpenAI `text-embedding-3-small` (1536 dimensions, best cost/quality ratio).

**Consequence**: New env var `OPENAI_API_KEY` (for embeddings only), pgvector extension must be enabled on Supabase.

### ADR-005: Meeting Storage — Summary Only + Reference Link

**Decision**: Store only the Fireflies AI summary and metadata, not the full transcript. Keep `firefliesTranscriptId` to fetch full transcript on demand if needed.

**Why**: Full transcripts can be 10,000+ words per meeting. The AI summary contains sufficient information for Claude extraction. Fireflies retains transcripts on their platform.

### ADR-006: Investigation — Firecrawl + Claude Extraction

**Decision**: Use Firecrawl REST API to scrape and extract clean markdown from web pages, then pass to Claude for structured entity extraction. No headless browser or manual HTML parsing.

**Sources**: Company website (home + about + services pages), tech stack detection (headers/meta tags), domain WHOIS, social media links. Google Business and review sites as optional additions.

**Why**: Third-party enrichment APIs (Clearbit, Apollo) are expensive. Firecrawl handles JS-rendered pages, strips ads/nav/boilerplate, and returns clean markdown optimized for LLM consumption — eliminating the need for cheerio HTML parsing. Free tier provides 500 pages/month, more than sufficient for expected investigation volume (~20-50 pages/month). The Claude extraction step produces high-quality structured output from the clean markdown.

### ADR-007: Scheduled Meetings — Separate Table from Fireflies Meetings

**Decision**: Create a `scheduled_meetings` table separate from the existing `meetings` table (which stores Fireflies transcripts). Link them via a nullable FK after the meeting occurs.

**Why**: Scheduled meetings and completed transcripts have fundamentally different lifecycles. A scheduled meeting exists before any recording. The Fireflies `meetings` table is populated by automated polling, while scheduled meetings are created manually by the developer. Keeping them separate avoids overloading one table with conflicting statuses and nullable fields. A completed transcript links back to its scheduled meeting via `scheduledMeetingId`.

**Consequence**: Two meeting-related tables. The UI must present a unified "meetings" view that shows both upcoming (scheduled) and past (transcribed) meetings.

### ADR-008: Meeting Preparation — 1:1 with Scheduled Meeting

**Decision**: Each scheduled meeting gets exactly one `meeting_preparations` row (1:1 relationship). Regenerating a preparation replaces the existing row rather than creating a new one.

**Why**: Multiple preparations per meeting adds complexity with no user value. The developer wants to review one definitive preparation document per meeting, not manage a history of drafts. The old preparation data is replaced in place — no audit trail needed for drafts.

**Consequence**: Simple data model. `meeting_preparations.scheduledMeetingId` is UNIQUE.

### ADR-009: Frozen Company Snapshot in Preparation

**Decision**: Store a `companySnapshot` (jsonb) in the preparation at generation time instead of joining live company data at render time.

**Why**: If the developer reviews the preparation, then the company record changes (via investigation or manual edit), the preparation would silently show different data than when it was generated. Freezing the snapshot ensures the interview guide and gap analysis remain consistent with the data they were derived from. A "Regenerate" button lets the developer refresh with current data when needed.

**Consequence**: Slightly larger storage per preparation (duplicated company data). Worth it for data consistency.

### ADR-010: Fireflies Transcript Matching — Conservative Fuzzy Match

**Decision**: Match Fireflies transcripts to scheduled meetings using a multi-signal scoring algorithm: company name match (weight 0.4), date proximity within ±2 days (weight 0.35), and title similarity via `pg_trgm` (weight 0.25). Only auto-link above 0.6 combined confidence.

**Why**: Fireflies transcripts don't contain a "scheduled meeting ID" — matching must be inferred. Company match is the strongest signal (meetings are linked to companies). Date proximity handles scheduling drift. Title similarity catches cases where company isn't mentioned but meeting titles match. The 0.6 threshold prevents false positives; below it, the developer is prompted to manually link.

**Consequence**: Requires `pg_trgm` extension on Supabase (`CREATE EXTENSION IF NOT EXISTS pg_trgm`). Most matches will be high-confidence if meetings are properly linked to companies.

### ADR-011: Google Calendar Integration — OAuth + Dedicated Calendar

**Decision**: Two-way sync with Google Calendar via standard OAuth. Meetings created in-app push to a dedicated Google Calendar; events added to that calendar sync back into the app.

**Auth**: Manual OAuth flow using `googleapis` library (no NextAuth — app is single-user with no auth system). Tokens stored in a `google_calendar_tokens` DB table. Automatic refresh on expiry.

**Dedicated calendar**: On first connect, user selects an existing calendar or creates a new "Client Meetings" calendar. Only events on that calendar participate in sync.

**Sync direction**: App → Google is immediate (server action creates/updates/deletes event on save). Google → App is polled via Trigger.dev scheduled task every 10 minutes using Google Calendar's incremental sync (`syncToken`), consistent with ADR-002 (Fireflies polling pattern).

**Conflict resolution**: Last write wins. At 10-20 meetings/month with a single user, conflicts are effectively impossible.

**Consequence**: New env vars `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`. New dep `googleapis` in `web/package.json`. New `google_calendar_tokens` table. New column `googleCalendarEventId` on `scheduled_meetings`. Google Calendar API is free within quotas (1M queries/day).

### ADR-012: Cost Tracking — Single Expenses Table with Allocation Splits

**Decision**: Use one `expenses` table for both subscriptions and one-time costs, with `expense_allocations` to split costs across multiple projects by percentage. Track revenue separately in a `payments` table linked to projects.

**Why**: A unified expense model avoids the complexity of separate subscription-tracking infrastructure (no cron jobs, no auto-generated entries). Subscriptions are simply recurring expenses logged once per billing cycle — a "Generate Recurring" button pre-fills this month's entries from last month's active subscriptions. This keeps the developer in control and aware of all costs.

**Consequence**: Monthly recurring expenses require a manual action (clicking "Generate Recurring"). At 10-20 subscriptions, this takes ~30 seconds per month. If it becomes tedious, automation via Trigger.dev `schedules.task` can be added later. The `paidBy` field is plain text (dev name) — no team_members table needed at current scale.

### ADR-013: Google Calendar Sync — Polling with Incremental Sync Token

**Decision**: Poll Google Calendar API via Trigger.dev `schedules.task` every 10 min using incremental sync (`syncToken`) rather than push notifications (webhooks).

**Why**: Push notifications require a verified public HTTPS endpoint and domain verification. Polling with `syncToken` is efficient (returns only changes since last sync), matches the Fireflies polling approach, and reuses existing Trigger.dev infrastructure. At meeting volume of 10-20/month, polling every 10 min is more than adequate.

**Consequence**: Up to 10 min delay for Google → App sync. Acceptable for meeting scheduling.

---

## Schema Changes

### New Tables

**`meetings`** (Phase 1)
```
id                      text PK (prefix: mt_)
firefliesTranscriptId   text UNIQUE NOT NULL
title                   text NOT NULL
meetingDate             timestamptz NOT NULL
duration                integer (seconds)
participants            jsonb [{name, email}]
aiSummary               text
status                  text NOT NULL DEFAULT 'pending_extraction'
                        -- pending_extraction | extracted | ready_for_review | reviewed | rejected | extraction_failed
companyId               text FK → companies.id (nullable, set after review)
createdAt / updatedAt   timestamptz
```

**`meeting_extractions`** (Phase 1)
```
id                text PK (prefix: mx_)
meetingId         text FK → meetings.id UNIQUE
rawExtraction     jsonb NOT NULL (full Claude response with per-field confidence)
matchSuggestions  jsonb (entity matching results)
confirmedData     jsonb (user-reviewed final data)
status            text NOT NULL DEFAULT 'pending_review'
                  -- pending_review | ready_for_review | confirmed | rejected
createdAt / updatedAt   timestamptz
```

**`scheduled_meetings`** (Phase 1.5)
```
id                    text PK (prefix: sm_)
companyId             text FK → companies.id NOT NULL
title                 text NOT NULL
scheduledDate         timestamptz NOT NULL
duration              integer (minutes, default 60)
meetingType           text NOT NULL DEFAULT 'discovery'
                      -- discovery | follow_up | project_kickoff | review | general
location              text (zoom link, address, or "phone")
notes                 text (pre-meeting notes)
agenda                text[] (agenda items)
status                text NOT NULL DEFAULT 'scheduled'
                      -- scheduled | prepared | in_progress | completed | cancelled
meetingId             text FK → meetings.id (nullable, linked after Fireflies transcript match)
googleCalendarEventId text (nullable, set when synced to/from Google Calendar)
preparationStatus     text NOT NULL DEFAULT 'not_started'
                      -- not_started | generating | ready | failed
createdAt / updatedAt timestamptz
```

**`google_calendar_tokens`** (Phase 1.5)
```
id              text PK (prefix: gt_)
accessToken     text NOT NULL
refreshToken    text NOT NULL
expiresAt       timestamptz NOT NULL
scope           text NOT NULL
calendarId      text (selected dedicated calendar ID)
syncToken       text (Google Calendar incremental sync token)
createdAt / updatedAt   timestamptz
```

**`meeting_preparations`** (Phase 1.5)
```
id                    text PK (prefix: mp_)
scheduledMeetingId    text FK → scheduled_meetings.id UNIQUE NOT NULL
companySnapshot       jsonb NOT NULL (frozen company data at generation time)
interviewGuide        jsonb NOT NULL (structured guide — see InterviewGuide schema below)
knowledgeGaps         jsonb NOT NULL (what we don't know yet)
discussionTopics      jsonb NOT NULL (suggested talking points)
similarProjects       jsonb (past projects in same industry/niche, if any)
investigationId       text FK → company_briefs.id (nullable, links to auto-triggered investigation)
status                text NOT NULL DEFAULT 'generating'
                      -- generating | ready | failed
triggerRunId          text
generatedAt           timestamptz
createdAt / updatedAt timestamptz
```

**InterviewGuide JSON Schema:**
```json
{
  "sections": [
    {
      "title": "Company Background",
      "context": "Why these questions matter",
      "questions": [
        {
          "question": "What prompted you to look for a new solution now?",
          "intent": "Understand urgency and pain points",
          "followUp": "How is this affecting your day-to-day operations?",
          "priority": "high"
        }
      ]
    }
  ],
  "iceBreakers": ["I saw you recently expanded to Austin — how's that going?"],
  "redFlags": ["Company website hasn't been updated since 2022 — may indicate budget constraints"],
  "keyFacts": ["Founded 2018, 15 employees, Series A funded"]
}
```

**`company_briefs`** (Phase 2)
```
id              text PK (prefix: cb_)
companyId       text FK → companies.id NOT NULL
status          text NOT NULL DEFAULT 'pending'
                -- pending | running | completed | failed
sections        jsonb (per-source investigation results)
summary         text (AI-generated brief)
appliedFields   jsonb (tracks which findings were accepted)
triggerRunId    text
startedAt / completedAt / createdAt / updatedAt   timestamptz
```

**`project_embeddings`** (Phase 3)
```
id              text PK (prefix: pe_)
projectId       text FK → projects.id UNIQUE
embedding       vector(1536) NOT NULL
inputText       text NOT NULL (the text that was embedded)
model           text NOT NULL DEFAULT 'text-embedding-3-small'
createdAt / updatedAt   timestamptz
```

**`expenses`** (Phase 4)
```
id              text PK (prefix: ex_)
description     text NOT NULL
amount          numeric(10,2) NOT NULL
currency        text NOT NULL DEFAULT 'USD'
type            text NOT NULL -- subscription | one_time
category        text NOT NULL -- tool | infrastructure | contractor | domain | hosting | license | other
billingCycle    text -- monthly | annual | quarterly | null (for one-time)
toolId          text FK → tools.id (nullable, for tool-related costs)
paidBy          text NOT NULL (dev name who paid)
paidAt          date NOT NULL
isActive        boolean NOT NULL DEFAULT true (for subscriptions — track if still active)
receiptUrl      text (optional link to receipt/invoice)
notes           text
createdAt / updatedAt   timestamptz
deletedAt       timestamptz
```

**`expense_allocations`** (Phase 4)
```
id              text PK (prefix: ea_)
expenseId       text FK → expenses.id NOT NULL
projectId       text FK → projects.id NOT NULL
percentage      numeric(5,2) NOT NULL (0.00-100.00)
createdAt       timestamptz
```

> Unallocated remainder (100% minus sum of allocations) is treated as overhead/general business cost.
> A constraint ensures the sum of percentages per expense never exceeds 100.

**`payments`** (Phase 4)
```
id              text PK (prefix: py_)
projectId       text FK → projects.id NOT NULL
description     text NOT NULL
amount          numeric(10,2) NOT NULL
currency        text NOT NULL DEFAULT 'USD'
paymentMethod   text (bank_transfer | credit_card | paypal | cash | crypto | other)
receivedAt      date NOT NULL
notes           text
createdAt / updatedAt   timestamptz
deletedAt       timestamptz
```

> Revenue is tied to projects, and projects already link to companies — so "who paid"
> is derived from `projects.companyId → companies.name`.

### Modified Tables

**`companies`** — add nullable columns (Phase 1):
- `location` text
- `companySize` text (solo/small/medium/large/enterprise)
- `revenueRange` text
- `yearsInBusiness` integer
- `currentTechStack` jsonb (string array)
- `socialMedia` jsonb (object: linkedin, facebook, instagram, etc.)

**`projects`** — add columns (Phase 3):
- `budget` text
- `requirements` text
- `outcome` text (post-completion description)
- `outcomeRating` integer (1-5)
- `blueprintId` text FK → blueprints.id
- `matchedProjectId` text FK → projects.id (template source)

### New ID Prefixes

Add to both `web/src/lib/ids.ts` and `src/utils/id.ts`:
```
meeting: "mt", meetingExtraction: "mx", scheduledMeeting: "sm",
meetingPreparation: "mp", googleCalendarToken: "gt", companyBrief: "cb",
projectEmbedding: "pe", expense: "ex", expenseAllocation: "ea", payment: "py"
```

### PostgreSQL Extensions

```sql
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;  -- For Fireflies transcript matching (Phase 1.5)
-- After creating project_embeddings table:
CREATE INDEX ON project_embeddings USING hnsw (embedding vector_cosine_ops);
```

Drizzle ORM custom type for vector column:
```typescript
const vector = customType<{ data: number[]; driverParam: string }>({
  dataType() { return "vector(1536)"; },
  toDriver(value: number[]) { return `[${value.join(",")}]`; },
  fromDriver(value: string) { return JSON.parse(value); },
});
```

---

## User Stories by Phase

### Phase 0: Infrastructure

- [x] **US-P0-01: Deploy web app to Vercel** (Size: M)
  - Import GitHub repo in Vercel, set Root Directory to `web`
  - Configure environment variables (DATABASE_URL with Supavisor pooler URL port 6543)
  - Update `web/src/lib/db.ts` to add `prepare: false` for PgBouncer compatibility
  - Auto-deploy on push to main

- [x] **US-P0-02: Deploy Trigger.dev** (Size: M)
  - Login via `npx trigger.dev@latest login`
  - Set env vars in Trigger.dev dashboard (DATABASE_URL direct port 5432, ANTHROPIC_API_KEY, FIREFLIES_API_KEY)
  - Deploy via `npx trigger.dev@latest deploy`
  - Verify hello-world task runs from dashboard

- [x] **US-P0-03: Set up CI/CD pipeline** (Size: S)
  - GitHub Actions: lint → type-check → build (web + root) on every push
  - Deploy Trigger.dev tasks on push to main
  - Vercel auto-deploys via GitHub integration

- [x] **US-P0-04: Upgrade Supabase to Pro + enable pgvector** (Size: S)
  - Upgrade at Supabase Dashboard → Billing
  - Run `CREATE EXTENSION IF NOT EXISTS vector` in SQL Editor

- [x] **US-P0-05: Set up monitoring** (Size: S)
  - Sentry for Next.js (`npx @sentry/wizard@latest -i nextjs`)
  - Health check endpoint at `/api/health`
  - UptimeRobot or Better Stack for uptime monitoring

### Phase 1: Fireflies Import + AI Extraction

- [x] **US-P1-01: Poll Fireflies for new transcripts** (Size: M)
  - Trigger.dev `schedules.task` runs every 15 min
  - Queries Fireflies GraphQL API for transcripts completed since last sync
  - Creates `meetings` rows (status: `pending_extraction`)
  - Skips duplicates via `firefliesTranscriptId` unique constraint
  - **AC**: Given API key configured, when poll runs, then new transcripts appear as meetings with `pending_extraction` status. If API unreachable, retries 3x with backoff.

- [x] **US-P1-02: Extract structured data via Claude** (Size: L)
  - Trigger.dev task chained from sync task
  - Sends meeting `aiSummary` to Claude API with structured extraction prompt using `tool_use`
  - Extracts: company name, contact info, website, location, size, revenue, tech stack, social media, industry, niche, products, services, stakeholders, budget, pain points, requirements, timeline, urgency, follow-up items
  - Each field includes a confidence score (0-1)
  - Validates response with Zod schema; retries once on validation failure
  - Stores result in `meeting_extractions` (status: `pending_review`)
  - **AC**: Given a meeting with `pending_extraction` status, when extraction task runs, then extraction row is created with per-field confidence scores. If Claude fails after retries, meeting status set to `extraction_failed`.

- [x] **US-P1-03: Match extracted entities to existing DB records** (Size: M)
  - Compare extracted company name against `companies` table (case-insensitive ILIKE + Levenshtein distance)
  - Compare catalog items against respective tables
  - Confidence scoring: exact match = 1.0, case-insensitive = 0.95, substring = 0.7, website domain match = 0.8, no match = 0.0
  - Store match suggestions in extraction's `matchSuggestions` jsonb
  - Update extraction status to `ready_for_review`

- [x] **US-P1-04: Review and confirm extracted data** (Size: L)
  - Full-page review screen at `/meetings/[id]/review`
  - Sections: Meeting Info (read-only), Company (editable fields + match dropdown), Catalog (per-item confidence + select existing or create new), Meeting Details (editable with include/exclude checkboxes)
  - Confidence badges: green >= 0.8, yellow 0.5-0.79, red < 0.5
  - Each catalog entity shows: extracted value, confidence badge, select dropdown (Create New + existing matches sorted by confidence)
  - "Confirm & Save": creates/links company, creates/matches catalog entities, stores `confirmedData`, redirects to company detail
  - "Reject": marks as rejected, no DB writes, redirects to `/meetings`
  - **AC**: Given extraction with `ready_for_review` status, when I confirm, then company is created/linked, catalog entities matched/created, and meeting status becomes `reviewed`. When I reject, no writes occur.

- [x] **US-P1-05: Meetings list page** (Size: S)
  - `/meetings` with table: Title, Date, Duration, Company (if linked), Status badge
  - Sorted by date descending
  - Links to review page if `ready_for_review`, otherwise read-only detail
  - "Meetings" nav item in sidebar (Mic icon)

- [x] **US-P1-06: Retry failed extractions** (Size: S)
  - "Retry Extraction" button on meetings with `extraction_failed` status
  - Resets to `pending_extraction` and triggers extraction task

- [x] **US-P1-07: Enrich companies table** (Size: S)
  - Add new nullable columns to `companies` via Drizzle migration
  - Display new fields on company detail page when present
  - Include in edit company form

> **Phase 1 — Pending setup**: `ANTHROPIC_API_KEY` still needs to be added to both `.env` (local) and the Trigger.dev dashboard. The key is from a shared Anthropic account. `FIREFLIES_API_KEY` also needs to be set. Once both keys are configured, the sync-fireflies scheduled task and Claude extraction will be fully operational.

### Phase 1.5: Meeting Preparation

- [ ] **US-MP-01: Schedule an upcoming meeting** (Size: M)
  - Form at `/meetings/schedule` with fields: company (select), title, date/time, duration, type (discovery/follow-up/kickoff/review/general), location, notes, agenda items
  - Company is required — this is how the system knows who to prepare for
  - Saves to `scheduled_meetings` with status `scheduled`
  - If Google Calendar is connected, also creates a corresponding event on the dedicated calendar and stores `googleCalendarEventId`
  - If Google Calendar is not connected, works as before (app-only)
  - **AC**: Given I fill all required fields and select a company, when I submit, then a scheduled meeting is created with status `scheduled` and appears in the meetings list. Given Google Calendar is connected, then the event also appears on the dedicated calendar. Given I leave company blank, when I submit, then validation error is shown.

- [ ] **US-MP-01a: Connect Google Calendar** (Size: M)
  - "Connect Google Calendar" button in Settings page initiates standard OAuth flow
  - Requests `calendar.readonly` + `calendar.events` scopes
  - On successful callback, stores tokens in `google_calendar_tokens` table
  - After connecting, user selects an existing calendar or creates a new "Client Meetings" calendar as the dedicated sync calendar
  - Settings page shows connection status: connected calendar name, last sync time, "Disconnect" button
  - Disconnect clears tokens from DB (does not delete calendar or events)
  - If token refresh fails (revoked access), show "Reconnect" prompt on Settings page and meeting pages
  - **AC**: Given I click "Connect Google Calendar", when OAuth completes, then tokens are stored and I can select a calendar. Given I click "Disconnect", then tokens are removed and sync stops. Given my token is revoked, then I see a "Reconnect" prompt.

- [ ] **US-MP-01b: Sync events from Google Calendar** (Size: M)
  - Trigger.dev `schedules.task` polls the dedicated calendar every 10 min using incremental sync (`syncToken`)
  - New events on the dedicated calendar create `scheduled_meetings` rows with status `pending_company_link` — user must link a company before preparation can generate
  - Updated events on the calendar update the corresponding `scheduled_meetings` row
  - Deleted events on the calendar mark the corresponding row as `cancelled`
  - Deduplication via `googleCalendarEventId` — events already synced are skipped
  - If dedicated calendar is deleted, task logs error and shows "Reconfigure calendar" prompt in Settings
  - **AC**: Given I create an event on the dedicated Google Calendar, when sync runs, then a scheduled meeting appears in the app with status `pending_company_link`. Given I delete a synced event from Google Calendar, when sync runs, then the scheduled meeting is marked `cancelled`.

- [ ] **US-MP-01c: Push meeting changes to Google Calendar** (Size: S)
  - When a scheduled meeting is created, edited, or cancelled in-app, the corresponding Google Calendar event is created, updated, or deleted
  - If Google API call fails (network, token expired), meeting is still saved locally — sync retries on next poll cycle
  - Editing meeting title, date, duration, or location in-app updates the Google Calendar event
  - **AC**: Given I edit a meeting's date in the app, when I save, then the Google Calendar event updates. Given Google API is unreachable, when I save, then the meeting saves locally and syncs later.

- [ ] **US-MP-02: View upcoming and past meetings in unified list** (Size: S)
  - `/meetings` page shows two sections: "Upcoming" (scheduled meetings sorted by date ascending) and "Past" (Fireflies transcripts sorted by date descending)
  - Upcoming meetings show: title, company, date, type badge, preparation status badge
  - Each upcoming meeting links to `/meetings/scheduled/[id]`
  - **AC**: Given I have 3 scheduled meetings and 5 transcripts, when I visit `/meetings`, then I see both sections with correct counts and sorting.

- [ ] **US-MP-03: Auto-trigger company investigation on scheduling** (Size: M)
  - When a scheduled meeting is created for a company that has NEVER been investigated (no `company_briefs` row), automatically trigger the investigation task
  - If an investigation already exists and is < 30 days old, skip it
  - If an investigation exists but is > 30 days old, trigger a fresh one
  - Link the investigation to the meeting preparation via `investigationId`
  - **AC**: Given company "Acme" has no prior investigation, when I schedule a meeting with Acme, then investigation is auto-triggered and `preparationStatus` is `generating`. Given company "Acme" was investigated 10 days ago, when I schedule a meeting, then no new investigation is triggered.

- [ ] **US-MP-04: Generate AI interview guide** (Size: L)
  - Trigger.dev task `generate-interview-guide` runs after investigation completes (or immediately if investigation already exists)
  - Inputs to Claude: company snapshot (name, industry, niche, products/services, tech stack, website, size, location, social media), investigation results (if available), meeting type, developer's notes/agenda, knowledge gaps (fields where company data is missing)
  - Claude generates structured `InterviewGuide` JSON via `tool_use`: sections with contextual questions, ice breakers, red flags, key facts
  - Questions are tailored to meeting type (discovery = broad exploratory, follow-up = specific progress, kickoff = scope and timeline)
  - Stores result in `meeting_preparations` with `companySnapshot` frozen at generation time
  - **AC**: Given a scheduled discovery meeting with a company that has website + industry but no revenue/size info, when guide is generated, then it includes questions probing revenue range and team size under "Knowledge Gaps" section, plus industry-specific questions. Given a follow-up meeting, when guide is generated, then questions reference previous meeting context.

- [ ] **US-MP-05: Knowledge gap analysis** (Size: M)
  - Compare company record against a "completeness template" of desired fields
  - Missing or empty fields become knowledge gaps
  - Each gap maps to 1-2 suggested interview questions
  - Gaps are prioritized: critical (name, industry, website), important (size, revenue, tech stack), nice-to-have (social media, years in business)
  - **AC**: Given company has name and website but no industry, size, or revenue, when preparation is generated, then `knowledgeGaps` contains 3 gaps with priority levels and suggested questions.

- [ ] **US-MP-06: Discussion topic suggestions** (Size: M)
  - Based on company industry/niche, suggest relevant talking points
  - Reference similar past projects (if any exist in same industry/niche) to suggest "we've done X for companies like yours"
  - Include industry trends or common pain points from the investigation brief
  - **AC**: Given company is in "E-commerce" niche with 2 past projects in same niche, when preparation is generated, then `discussionTopics` includes references to those projects and e-commerce-specific topics.

- [ ] **US-MP-07: View meeting preparation page** (Size: L)
  - `/meetings/scheduled/[id]` shows: meeting details (header), preparation status, and when ready:
    - **Interview Guide**: Expandable sections with questions, intent, follow-ups, priority badges
    - **Key Facts**: Card-style display of company snapshot data
    - **Knowledge Gaps**: Checklist of missing info with suggested questions
    - **Discussion Topics**: Bullet list with context
    - **Similar Projects**: Cards showing past projects in same industry/niche (if any)
    - **Red Flags**: Warning-style callouts
    - **Ice Breakers**: Casual conversation starters
  - "Regenerate Preparation" button to refresh with latest company data
  - "Print / Export" button for taking to meeting
  - **AC**: Given a preparation with status `ready`, when I visit the page, then all sections render with data from `meeting_preparations`. Given status is `generating`, then I see a loading state with progress indicator.

- [ ] **US-MP-08: Regenerate preparation with updated data** (Size: S)
  - "Regenerate" button re-triggers the preparation task
  - Fetches fresh company data (including any investigation updates)
  - Replaces existing `meeting_preparations` row (ADR-008)
  - **AC**: Given I regenerate a preparation, when task completes, then the preparation shows updated company data and new questions reflecting any changes.

- [ ] **US-MP-09: Link Fireflies transcript to scheduled meeting** (Size: M)
  - When Fireflies sync finds a new transcript, run matching algorithm against unlinked scheduled meetings:
    - Company name match (weight 0.4): transcript company vs scheduled meeting company
    - Date proximity (weight 0.35): transcript date within ±2 days of scheduled date
    - Title similarity via `pg_trgm` (weight 0.25): transcript title vs scheduled meeting title
  - Above 0.6 combined confidence: auto-link (`scheduled_meetings.meetingId = meetings.id`)
  - Below 0.6: show "Possible match" suggestion on meetings list — developer confirms or dismisses
  - **AC**: Given a scheduled meeting for "Acme Corp" on Jan 15 titled "Discovery Call", when a Fireflies transcript for "Acme Corp" dated Jan 15 titled "Acme Discovery" arrives, then it auto-links with confidence > 0.6. Given a transcript with no matching company, then no auto-link occurs and it appears as unlinked.

- [ ] **US-MP-10: Mark scheduled meeting as completed** (Size: S)
  - When a Fireflies transcript is linked, scheduled meeting status transitions to `completed`
  - If no transcript arrives within 48 hours of scheduled date, show "No recording found" badge
  - Manual "Mark as Completed" button for meetings that weren't recorded
  - **AC**: Given a scheduled meeting with a linked transcript, then status is `completed`. Given a meeting 48+ hours past with no transcript, then it shows "No recording found" badge.

- [ ] **US-MP-11: Scheduled meetings in sidebar** (Size: S)
  - Sidebar "Meetings" item shows badge count of upcoming meetings in next 7 days
  - Badge updates on page navigation
  - **AC**: Given 2 meetings scheduled within the next 7 days, when I view any page, then the Meetings sidebar item shows "(2)" badge.

- [ ] **US-MP-12: Export preparation as PDF** (Size: M)
  - "Export" button generates a clean, printable preparation document
  - Includes: meeting details, key facts, interview guide (questions + intents), knowledge gaps, discussion topics
  - Uses browser print CSS (`@media print`) for clean output
  - **AC**: Given a ready preparation, when I click "Export" and print to PDF, then the output is a well-formatted single document with all preparation sections.

- [ ] **US-MP-13: Preparation effectiveness tracking** (Size: S)
  - After a meeting is completed (transcript linked), show a quick rating: "How useful was the preparation?" (1-5 stars)
  - Stored in `scheduled_meetings` as `preparationRating`
  - Displayed in meetings list for historical reference
  - Used to tune prompt quality over time (which types of questions led to better meetings)
  - **AC**: Given a completed meeting, when I rate the preparation 4 stars, then the rating is stored and visible in the meetings list.

### Phase 2: Company Investigation

- [ ] **US-P2-01: Trigger investigation from company page** (Size: L)
  - "Investigate" button on `/companies/[id]`
  - Creates `company_briefs` row, triggers Trigger.dev task
  - Task scrapes via Firecrawl API: website (home + about + services pages as clean markdown), tech stack (headers/meta tags), domain WHOIS, social media links
  - Each source runs independently (one failure doesn't block others)
  - Claude synthesizes all gathered markdown into a structured summary
  - Status updates: pending → running → completed/failed
  - Button shows spinner while running, disabled if already in progress

- [ ] **US-P2-02: Review investigation with diff view** (Size: L)
  - After investigation completes, company page shows "Investigation Results" section
  - Diff-style view per field: Field Name | Current Value | Discovered Value | Accept/Ignore
  - Green = new info not in record, Yellow = differs from existing, Gray = matches
  - "Apply Selected" commits all accepted changes via single server action
  - "Missing Info" section lists fields investigation couldn't find (needs follow-up meeting)
  - All results preserved in `company_briefs` for audit trail

- [ ] **US-P2-03: Downloadable company brief** (Size: M)
  - "Download Brief" button after investigation completes
  - Includes: company info, industry/niche, products/services, tech stack, investigation findings, linked projects, gaps section
  - Markdown rendered in-browser + "Download as PDF" via browser print
  - Generation timestamp included

### Phase 3: Blueprint Matching & Project Reuse

- [ ] **US-P3-01: Generate embeddings for projects** (Size: L)
  - Trigger.dev task generates embedding via OpenAI `text-embedding-3-small`
  - Input text: project name + description + company industry/niche + tool names + blueprint name
  - Triggered when project status → `completed`, or manually via "Generate Embedding" button
  - Stored in `project_embeddings` table

- [ ] **US-P3-02: Find similar projects when creating new one** (Size: L)
  - "Find Similar Projects" button in new project form (after entering name + description + company)
  - Generates transient embedding, runs cosine similarity search (`<=>` operator)
  - Shows top 5 matches: project name, company name, similarity %, tools, blueprint, outcome rating
  - Projects with `outcomeRating >= 4` highlighted as "recommended"
  - Each result has "Use as Template" button

- [ ] **US-P3-03: Auto-populate from matched template** (Size: M)
  - "Use as Template" copies: description (editable), project_tools entries, linked blueprint
  - Note stored: "Created from template: [source project] (similarity: X%)"
  - User confirms and can modify before final creation

- [ ] **US-P3-04: Rate completed projects** (Size: S)
  - When project status = `completed`, show "Outcome Rating" section
  - 5-star rating UI + optional outcome text field
  - Rating used as weighting factor in future similarity search: `similarity * (rating / 5.0)`

### Phase 4: Cost & Revenue Management

- [ ] **US-C-01: Add a one-time expense** (Size: S)
  - Form at `/costs` (Expenses tab) with fields: description, amount, currency, category (dropdown), tool (optional select), paid by (text/dropdown of known names), date, receipt URL, notes
  - Type is set to `one_time`, billingCycle is null
  - **AC**: Given I fill description + amount + category + paidBy + date, when I submit, then expense is created and appears in the expenses table. Given I link it to a tool, then it shows the tool name in the table.

- [ ] **US-C-02: Add a recurring subscription** (Size: S)
  - Same form as one-time but with type `subscription` and a billing cycle selector (monthly/annual/quarterly)
  - `isActive` defaults to true
  - **AC**: Given I add "Supabase Pro" as a monthly subscription for $25, when I save, then it appears in the expenses table with a "Recurring" badge and "Monthly" cycle label.

- [ ] **US-C-03: Allocate expense to projects** (Size: M)
  - After creating an expense, "Allocate" button opens a modal/inline form
  - Select project(s) from dropdown, assign percentage to each
  - Percentages are validated: sum must not exceed 100%
  - Unallocated remainder shown as "Overhead" in the UI
  - **AC**: Given an expense of $100, when I allocate 60% to Project A and 30% to Project B, then Project A shows $60, Project B shows $30, and $10 is shown as overhead. Given I try to allocate 70% + 50%, then validation error prevents it.

- [ ] **US-C-04: Generate recurring expenses** (Size: M)
  - "Generate Recurring" button on the expenses tab
  - Finds all active subscriptions, creates new expense entries for the current billing period
  - Pre-fills allocations from the most recent entry of each subscription
  - Shows a confirmation modal: list of subscriptions to be generated, total amount, pre-filled allocations
  - Developer can edit allocations or skip individual subscriptions before confirming
  - Deduplication: skips subscriptions that already have an entry for the current period
  - **AC**: Given 3 active monthly subscriptions, when I click "Generate Recurring" in February, then 3 new expense entries are created dated February with last month's allocations. Given one subscription already has a February entry, then only 2 are generated.

- [ ] **US-C-05: Record a payment (revenue)** (Size: S)
  - Form on the Revenue tab: project (select), description, amount, payment method (dropdown), date received, notes
  - Project is required — revenue is always tied to a project
  - **AC**: Given I record a $5000 payment for Project A via bank transfer, when I save, then it appears in the revenue table linked to Project A and its company.

- [ ] **US-C-06: Expenses list with filters** (Size: M)
  - `/costs` Expenses tab shows a filterable/sortable table: Date, Description, Amount, Category, Type badge (one-time/subscription), Tool, Paid By, Allocations summary
  - Filters: date range, category, type (all/subscription/one-time), tool, paid by
  - Quick stats at top: total this month, total subscriptions (monthly burn rate), total one-time
  - **AC**: Given 10 expenses across 3 categories, when I filter by "tool" category, then only tool expenses are shown. When I clear filters, all 10 are shown.

- [ ] **US-C-07: Revenue list with filters** (Size: S)
  - Revenue tab shows: Date, Description, Amount, Project, Company (derived), Payment Method
  - Filters: date range, project, company
  - Quick stats: total revenue this month, total revenue this quarter
  - **AC**: Given 5 payments across 3 projects, when I filter by Project A, then only Project A payments are shown.

- [ ] **US-C-08: Profitability dashboard** (Size: L)
  - Profitability tab with three views:
    - **Per Project**: table with columns — Project Name, Company, Total Costs (allocated), Total Revenue, Profit, Margin %
    - **Per Client**: aggregate across all projects for each company — Company Name, # Projects, Total Costs, Total Revenue, Profit, Margin %
    - **Per Tool**: how much each tool costs total and per month — Tool Name, Monthly Cost, Total Cost, # Projects Using
  - Date range selector (this month / this quarter / this year / all time / custom)
  - Color coding: green for profitable (margin > 20%), yellow (0-20%), red (negative margin)
  - **AC**: Given Project A has $200 in allocated costs and $1000 in revenue, when I view per-project profitability, then it shows $800 profit and 80% margin in green. Given Project B has $500 in costs and $0 in revenue, then it shows -$500 and negative margin in red.

- [ ] **US-C-09: Cost summary on project detail page** (Size: S)
  - On the existing `/projects/[id]` page, add a "Financials" section
  - Shows: total allocated costs, total revenue (payments), profit/margin
  - Link to "View in Costs" to jump to the filtered costs page
  - **AC**: Given Project A has 3 allocated expenses totaling $150 and 2 payments totaling $3000, when I view the project page, then the Financials section shows costs: $150, revenue: $3000, profit: $2850, margin: 95%.

- [ ] **US-C-10: Deactivate a subscription** (Size: S)
  - "Deactivate" button on subscription expenses sets `isActive = false`
  - Deactivated subscriptions are excluded from "Generate Recurring"
  - Shown with a strikethrough/dimmed style in the expenses table
  - **AC**: Given I deactivate "Old Tool" subscription, when I click "Generate Recurring" next month, then "Old Tool" is not included. The expense still appears in historical views but is visually marked as inactive.

- [ ] **US-C-11: Monthly burn rate widget on dashboard** (Size: S)
  - On the main `/dashboard` page, add a "Monthly Burn Rate" card
  - Sum of all active subscriptions' monthly-equivalent amounts (annual / 12, quarterly / 3)
  - Shows trend: up/down arrow comparing to last month
  - **AC**: Given 2 monthly subscriptions ($25 + $19) and 1 annual subscription ($120), when I view the dashboard, then monthly burn rate shows $54 ($25 + $19 + $10).

---

## Infrastructure Plan

### Vercel Deployment

- **Root Directory**: `web` (set in Vercel dashboard)
- **Framework**: Next.js (auto-detected)
- **Region**: `iad1` (match Supabase region)
- **DATABASE_URL**: Use Supavisor Transaction Pooler URL (port 6543) with `prepare: false`
- Update `web/src/lib/db.ts`:
  ```typescript
  const conn = globalForDb.conn ?? postgres(process.env.DATABASE_URL!, {
    max: 3,
    prepare: false, // Required for Supavisor transaction pooling
  });
  ```

### Environment Variables

| Variable | Vercel | Trigger.dev | Local |
|---|:---:|:---:|:---:|
| `DATABASE_URL` | Pooler (6543) | Direct (5432) | Direct (5432) |
| `ANTHROPIC_API_KEY` | - | Yes | Yes |
| `FIREFLIES_API_KEY` | - | Yes | Yes |
| `FIRECRAWL_API_KEY` | - | Yes | Yes |
| `OPENAI_API_KEY` | Yes | Yes | Yes |
| `TRIGGER_SECRET_KEY` | Yes | N/A | Yes |
| `GOOGLE_CLIENT_ID` | Yes | - | Yes |
| `GOOGLE_CLIENT_SECRET` | Yes | - | Yes |
| `SENTRY_DSN` | Yes | Yes | Optional |

### GitHub Actions CI/CD

**`.github/workflows/ci.yml`** — on every push/PR:
```
lint-and-typecheck → build-web + build-cli (parallel)
```

**`.github/workflows/deploy.yml`** — on push to main:
```
deploy-trigger (npx trigger.dev@latest deploy)
Vercel auto-deploys via GitHub integration
```

### New Dependencies

**Root `package.json`** (Trigger.dev tasks):
- `@anthropic-ai/sdk` — Claude API
- `openai` — Embeddings
- `firecrawl-js` — Web scraping via Firecrawl API (replaces cheerio)
- `whois-json` — Domain lookup

**`web/package.json`** (Next.js):
- `openai` — Query-time embedding generation for similarity search
- `googleapis` — Google Calendar API client

### Cost Estimate

| Service | Monthly |
|---|---|
| Supabase Pro | $25 |
| Vercel Hobby | $0 |
| Trigger.dev Free | $0 |
| Claude API (~100 extractions + ~20 interview guides) | ~$6-28 |
| Firecrawl Free (500 pages/mo) | $0 |
| Fireflies Business | $19/seat |
| Google Calendar API | $0 |
| Sentry Free | $0 |
| **Total** | **~$50-73** |

> Interview guide generation adds ~$0.40-2.20/month (negligible) — each guide is one Claude API call
> using the same extraction model. Investigation costs are already accounted for in Phase 2.

---

## New Web Pages & Components

### Pages
- `web/src/app/(dashboard)/meetings/page.tsx` — Unified meetings list (upcoming + past)
- `web/src/app/(dashboard)/meetings/schedule/page.tsx` — Schedule new meeting form (Phase 1.5)
- `web/src/app/(dashboard)/meetings/scheduled/[id]/page.tsx` — Meeting preparation view (Phase 1.5)
- `web/src/app/(dashboard)/meetings/[id]/review/page.tsx` — Extraction review (the big one)
- `web/src/app/(dashboard)/companies/[id]/brief/page.tsx` — Investigation results + diff view
- `web/src/app/(dashboard)/costs/page.tsx` — Cost & Revenue management with tabs (Phase 4)

### Components
- `web/src/components/meetings/meeting-table.tsx` — Status-filtered table
- `web/src/components/meetings/upcoming-meetings.tsx` — Upcoming scheduled meetings section (Phase 1.5)
- `web/src/components/meetings/extraction-review.tsx` — Interactive review form
- `web/src/components/meetings/confidence-badge.tsx` — Color-coded confidence display
- `web/src/components/meetings/preparation-view.tsx` — Interview guide + gaps + topics display (Phase 1.5)
- `web/src/components/meetings/interview-guide.tsx` — Expandable question sections with priority badges (Phase 1.5)
- `web/src/components/meetings/knowledge-gaps.tsx` — Missing info checklist (Phase 1.5)
- `web/src/components/meetings/discussion-topics.tsx` — Suggested talking points (Phase 1.5)
- `web/src/components/meetings/schedule-form.tsx` — Meeting scheduling form (Phase 1.5)
- `web/src/components/meetings/preparation-rating.tsx` — Post-meeting prep effectiveness rating (Phase 1.5)
- `web/src/components/settings/google-calendar-connect.tsx` — OAuth connect/disconnect + calendar picker (Phase 1.5)
- `web/src/components/briefs/brief-diff.tsx` — Current vs discovered diff view
- `web/src/components/briefs/brief-section.tsx` — Expandable brief section
- `web/src/components/projects/similar-projects.tsx` — Similarity search results
- `web/src/components/projects/outcome-form.tsx` — Star rating + outcome text
- `web/src/components/forms/investigate-button.tsx` — Trigger investigation
- `web/src/components/costs/expense-table.tsx` — Filterable expenses list (Phase 4)
- `web/src/components/costs/expense-form.tsx` — Add/edit expense form (Phase 4)
- `web/src/components/costs/allocation-form.tsx` — Project allocation modal (Phase 4)
- `web/src/components/costs/revenue-table.tsx` — Filterable payments list (Phase 4)
- `web/src/components/costs/payment-form.tsx` — Add/edit payment form (Phase 4)
- `web/src/components/costs/profitability-view.tsx` — Per-project/client/tool profit cards (Phase 4)
- `web/src/components/costs/generate-recurring.tsx` — Recurring subscription generation modal (Phase 4)
- `web/src/components/costs/burn-rate-card.tsx` — Monthly burn rate dashboard widget (Phase 4)

### Sidebar Update
Add between Companies and Projects:
```typescript
{ label: "Meetings", icon: Mic, href: "/meetings" },
```
Add after Projects:
```typescript
{ label: "Costs", icon: DollarSign, href: "/costs" },
```

---

## Critical Files

| File | Action | Why |
|---|---|---|
| `web/src/lib/schema.ts` | Modify | Add all new tables + columns (incl. scheduled_meetings, meeting_preparations) |
| `src/db/schema.ts` | Modify | Mirror schema changes (keep in sync) |
| `web/src/lib/ids.ts` + `src/utils/id.ts` | Modify | Add new prefixes (mt, mx, sm, mp, cb, pe, ex, ea, py) |
| `web/src/lib/queries.ts` | Modify | Add meeting, scheduled meeting, preparation, brief, embedding, cost queries |
| `web/src/lib/actions.ts` | Modify | Add scheduling, confirmation, investigation, preparation, outcome, cost actions |
| `web/src/lib/db.ts` | Modify | Add `prepare: false` for Vercel |
| `web/src/components/sidebar.tsx` | Modify | Add Meetings + Costs nav items |
| `web/src/app/(dashboard)/companies/[id]/page.tsx` | Modify | Add Investigate button, enriched fields |
| `src/trigger/example.ts` | Reference | Pattern for new Trigger.dev tasks |
| `src/trigger/generate-interview-guide.ts` | Create | Claude interview guide generation (Phase 1.5) |
| `src/trigger/lib/match-transcript.ts` | Create | Fireflies → scheduled meeting matching (Phase 1.5) |
| `src/trigger/lib/interview-guide-prompt.ts` | Create | Claude prompt engineering for interview guides (Phase 1.5) |
| `web/src/lib/calendar.ts` | Create | Google Calendar API client + sync logic (Phase 1.5) |
| `web/src/app/api/google/auth/route.ts` | Create | OAuth initiation (Phase 1.5) |
| `web/src/app/api/google/callback/route.ts` | Create | OAuth callback + token storage (Phase 1.5) |
| `src/trigger/sync-google-calendar.ts` | Create | Scheduled Google Calendar polling (Phase 1.5) |
| `web/src/app/(dashboard)/settings/page.tsx` | Rewrite | Add Google Calendar connection section (Phase 1.5) |
| `trigger.config.ts` | Modify | Add `build.external` if needed |
| `.github/workflows/ci.yml` | Rewrite | Full CI/CD pipeline |
| `web/src/app/(dashboard)/costs/page.tsx` | Create | Cost & Revenue management page (Phase 4) |
| `web/src/app/(dashboard)/projects/[id]/page.tsx` | Modify | Add Financials section (Phase 4) |
| `web/src/app/(dashboard)/page.tsx` | Modify | Add burn rate widget to dashboard (Phase 4) |

---

## Out of Scope

- Real-time Fireflies webhooks (polling is sufficient)
- Multi-user auth / RBAC (single user)
- Full transcript storage (summary + reference ID only)
- Automatic investigation on import (always manual trigger, except via meeting preparation)
- Real-time embedding updates (on completion or manual only)
- Custom AI model fine-tuning
- Invoice generation or client-facing billing (internal cost tracking only)
- Multi-currency conversion (single currency per entry, no FX rates)
- Automated subscription renewal detection (manual "Generate Recurring" button)
- Team members table (paidBy is a plain text field)
- Mobile-responsive UI (desktop-first)
- Email/Slack notifications
- Google Calendar push notifications / webhooks (polling with syncToken is sufficient — see ADR-013)
- Multi-calendar sync (single dedicated calendar only)
- Meeting preparation audit trail / versioning (replaced in place — see ADR-008)
- Automatic meeting scheduling from Fireflies (Fireflies API doesn't expose calendar data)

---

## Success Metrics

| Metric | Target | Measurement |
|---|---|---|
| Meeting-to-company time | < 2 min (from 15-30 min) | Time from sync to confirmed record |
| Extraction accuracy | > 85% fields accepted without editing | Compare `confirmedData` vs `rawExtraction` |
| Company profile completeness | > 80% fields filled after Phase 1 + 2 | Non-null fields / total fields |
| Project template reuse rate | > 50% of new projects use template | Template-sourced projects / total |
| Zero accidental DB writes | 0 unconfirmed AI writes | All extractions must go through review |
| Preparation usefulness | > 3.5 avg rating (out of 5) | Average `preparationRating` across completed meetings |
| Knowledge gap closure | > 60% gaps filled after meeting | Gaps in pre-meeting prep vs post-meeting extraction |
| Transcript match accuracy | > 90% auto-linked correctly | Manual corrections / total auto-links |
| Expense tracking coverage | 100% of subscriptions logged | Active subscriptions vs known tool count |
| Profitability visibility | Every active project has cost + revenue data | Projects with ≥1 expense or payment / active projects |

---

## Verification Plan

### Phase 0
1. Visit `https://your-app.vercel.app` — dashboard loads
2. Trigger.dev dashboard shows deployed tasks
3. `/api/health` returns `{ status: "healthy" }`
4. GitHub push triggers CI and Vercel deploy

**Phase 0 — Known Issues (Resolved):**
- ~~**CI `npm ci --prefix web` fails**~~: Fixed — using `npm install --prefix web` instead of `npm ci`.
- ~~**CI `next build` fails without DATABASE_URL**~~: Fixed — added `export const dynamic = "force-dynamic"` to all DB-dependent pages.
- ~~**Trigger.dev deploy workflow**~~: Fixed — uses `TRIGGER_ACCESS_TOKEN` (Personal Access Token) as GitHub secret.

### Phase 1
1. Add Fireflies API key → poll task runs → meetings appear in `/meetings`
2. Click a meeting → review page shows extracted data with confidence badges
3. Edit a field, select existing industry from dropdown → "Confirm & Save"
4. Company created/linked → redirected to company detail page with all data
5. Reject a meeting → no DB changes, status = rejected

### Phase 1.5
1. Go to `/meetings` → click "Schedule Meeting" → fill form with company + date + title
2. If company has no prior investigation → investigation auto-triggers in background
3. After investigation completes → interview guide generates automatically
4. Visit `/meetings/scheduled/[id]` → see full preparation: interview guide, knowledge gaps, discussion topics, key facts, ice breakers
5. Click "Regenerate" → preparation refreshes with latest company data
6. Click "Export" → clean printable PDF of preparation materials
7. After meeting, Fireflies transcript syncs → auto-links to scheduled meeting (if confidence > 0.6)
8. Scheduled meeting status transitions to `completed` → rate preparation effectiveness (1-5 stars)
9. Go to Settings → click "Connect Google Calendar" → complete OAuth flow
10. Select or create dedicated calendar → connection confirmed
11. Create a meeting in-app → verify it appears on Google Calendar
12. Create an event on dedicated Google Calendar → within 10 min it appears in app as pending company link
13. Edit meeting in-app → Google Calendar event updates
14. Delete event in Google Calendar → scheduled meeting marked cancelled after next sync

### Phase 2
1. Go to `/companies/[id]` → click "Investigate"
2. Button shows spinner → investigation runs in background
3. After completion → diff view shows current vs discovered data
4. Accept individual fields → company record updated
5. Click "Download Brief" → PDF/Markdown generated

### Phase 3
1. Create new project → enter name + description → click "Find Similar"
2. See top 5 matches with similarity scores
3. Click "Use as Template" → project pre-filled with tools + blueprint
4. Complete a project → rate it 1-5 stars
5. Next similar search ranks this project higher/lower based on rating

### Phase 4
1. Go to `/costs` → add a one-time expense (e.g., domain purchase $15) → appears in expenses table
2. Add a recurring subscription (e.g., Supabase Pro $25/mo linked to Supabase tool) → shows "Recurring" badge
3. Click "Allocate" on the expense → assign 50% to Project A, 30% to Project B → amounts split correctly
4. Go to Revenue tab → record a $5000 payment for Project A → appears with company name
5. Go to Profitability tab → see Project A with costs, revenue, and profit margin in green
6. Next month → click "Generate Recurring" → 1 subscription auto-generated with last month's allocations
7. Deactivate old subscription → next "Generate Recurring" skips it
8. Visit `/projects/[id]` → Financials section shows allocated costs + revenue + profit
9. Visit `/dashboard` → burn rate card shows monthly subscription total

---

## CLI Command Reference (Completed)

Pattern: `bot <entity> <action> [args] [--flags]`

```bash
# Companies
bot company add      [--name "Acme" --industry "healthcare" --niche "dental"]
bot company list     [--industry "healthcare" --status active]
bot company show     <id-or-name>
bot company edit     <id> [--name "New Name"]

# Projects
bot project add          --company <id> [--name "AI Receptionist"]
bot project list         [--company <id> --status "in_progress"]
bot project show         <id>
bot project advance      <id>
bot project status       <id> --set "completed"
bot project assign-tool  <id> --tool <tool-id>

# Tools
bot tool add     [--name "Voiceflow" --category "ai_platform"]
bot tool list    [--category "ai_platform"]

# Implementation Details
bot impl add     --project <id> --type "prompt" --title "System Prompt"
bot impl list    --project <id> [--type "prompt"]
bot impl show    <id>

# Progress Tracking
bot progress log       --project <id> --phase "build" --note "Integrated Voiceflow"
bot progress timeline  <project-id>

# Blueprints
bot blueprint add       [--name "Dental AI Receptionist" --industry "healthcare"]
bot blueprint show      <id>
bot blueprint add-step  <bp-id> --order 1 --title "Setup"
bot blueprint add-tool  <bp-id> --tool <tool-id>
bot blueprint apply     <blueprint-id> --company <id>
```
