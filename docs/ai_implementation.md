# Plan: AI-Powered Business Pipeline

## Context

After every client meeting recorded on Fireflies.ai, the developer manually reads notes, creates company records, and types in project details — a process that takes 15-30 minutes per meeting and is error-prone. When starting a new project, there's no way to discover that a nearly identical project was completed six months ago for a company in the same niche, leading to redundant setup. The system currently has no connection to external data sources, so company profiles contain only what the developer remembers to type.

**Goal**: Build a three-phase AI pipeline that transforms Fireflies meeting recordings into fully hydrated company profiles and intelligently pre-populated projects.

---

## Solution Overview

```
Fireflies records meeting
  → Trigger.dev polls for completed transcript (every 15 min)
  → Claude AI extracts company info + catalog entities + meeting details
  → Developer reviews everything on a dedicated review page
  → Confirms/edits/rejects each field before any DB write
  → Optionally triggers "Company Investigation" (web scraping + enrichment)
  → Investigation results shown as suggestions — developer approves individually
  → When creating a project, AI finds similar past projects via pgvector
  → Developer picks/adapts a blueprint or starts fresh
  → Completed projects get outcome ratings that feed back into matching
```

**Key principle**: No silent writes. Every AI-generated change requires explicit user confirmation.

---

## Phasing & Prioritization (ICE Scoring)

| Phase | Impact | Confidence | Ease | ICE Score | Effort |
|---|:---:|:---:|:---:|:---:|---|
| **Phase 0: Infrastructure** | 8 | 10 | 7 | 560 | ~3 days |
| **Phase 1: Fireflies + AI Extraction** | 9 | 8 | 6 | 432 | ~8 days |
| **Phase 2: Company Investigation** | 7 | 6 | 4 | 168 | ~6 days |
| **Phase 3: Blueprint Matching & Reuse** | 8 | 7 | 5 | 280 | ~5 days |

**Build order**: Phase 0 → Phase 1 → Phase 2 → Phase 3

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

### ADR-006: Investigation — HTTP Fetch + Claude Extraction (Hybrid)

**Decision**: Use lightweight HTTP fetching (cheerio for HTML parsing) to grab web page content, then pass text to Claude for structured extraction. No headless browser.

**Sources**: Company website (home + about + services pages), tech stack detection (headers/meta tags), domain WHOIS, social media links from HTML. Google Business and review sites as optional additions.

**Why**: Third-party enrichment APIs (Clearbit, Apollo) are expensive. Headless browsers are heavy. The hybrid approach is lightweight and the Claude extraction step produces high-quality structured output from raw HTML text.

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
meeting: "mt", meetingExtraction: "mx", companyBrief: "cb", projectEmbedding: "pe"
```

### pgvector Extension

```sql
CREATE EXTENSION IF NOT EXISTS vector;
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

**US-P0-01: Deploy web app to Vercel** (Size: M)
- Import GitHub repo in Vercel, set Root Directory to `web`
- Configure environment variables (DATABASE_URL with Supavisor pooler URL port 6543)
- Update `web/src/lib/db.ts` to add `prepare: false` for PgBouncer compatibility
- Auto-deploy on push to main

**US-P0-02: Deploy Trigger.dev** (Size: M)
- Login via `npx trigger.dev@latest login`
- Set env vars in Trigger.dev dashboard (DATABASE_URL direct port 5432, ANTHROPIC_API_KEY, FIREFLIES_API_KEY)
- Deploy via `npx trigger.dev@latest deploy`
- Verify hello-world task runs from dashboard

**US-P0-03: Set up CI/CD pipeline** (Size: S)
- GitHub Actions: lint → type-check → build (web + root) on every push
- Deploy Trigger.dev tasks on push to main
- Vercel auto-deploys via GitHub integration

**US-P0-04: Upgrade Supabase to Pro + enable pgvector** (Size: S)
- Upgrade at Supabase Dashboard → Billing
- Run `CREATE EXTENSION IF NOT EXISTS vector` in SQL Editor

**US-P0-05: Set up monitoring** (Size: S)
- Sentry for Next.js (`npx @sentry/wizard@latest -i nextjs`)
- Health check endpoint at `/api/health`
- UptimeRobot or Better Stack for uptime monitoring

### Phase 1: Fireflies Import + AI Extraction

**US-P1-01: Poll Fireflies for new transcripts** (Size: M)
- Trigger.dev `schedules.task` runs every 15 min
- Queries Fireflies GraphQL API for transcripts completed since last sync
- Creates `meetings` rows (status: `pending_extraction`)
- Skips duplicates via `firefliesTranscriptId` unique constraint
- **AC**: Given API key configured, when poll runs, then new transcripts appear as meetings with `pending_extraction` status. If API unreachable, retries 3x with backoff.

**US-P1-02: Extract structured data via Claude** (Size: L)
- Trigger.dev task chained from sync task
- Sends meeting `aiSummary` to Claude API with structured extraction prompt using `tool_use`
- Extracts: company name, contact info, website, location, size, revenue, tech stack, social media, industry, niche, products, services, stakeholders, budget, pain points, requirements, timeline, urgency, follow-up items
- Each field includes a confidence score (0-1)
- Validates response with Zod schema; retries once on validation failure
- Stores result in `meeting_extractions` (status: `pending_review`)
- **AC**: Given a meeting with `pending_extraction` status, when extraction task runs, then extraction row is created with per-field confidence scores. If Claude fails after retries, meeting status set to `extraction_failed`.

**US-P1-03: Match extracted entities to existing DB records** (Size: M)
- Compare extracted company name against `companies` table (case-insensitive ILIKE + Levenshtein distance)
- Compare catalog items against respective tables
- Confidence scoring: exact match = 1.0, case-insensitive = 0.95, substring = 0.7, website domain match = 0.8, no match = 0.0
- Store match suggestions in extraction's `matchSuggestions` jsonb
- Update extraction status to `ready_for_review`

**US-P1-04: Review and confirm extracted data** (Size: L)
- Full-page review screen at `/meetings/[id]/review`
- Sections: Meeting Info (read-only), Company (editable fields + match dropdown), Catalog (per-item confidence + select existing or create new), Meeting Details (editable with include/exclude checkboxes)
- Confidence badges: green >= 0.8, yellow 0.5-0.79, red < 0.5
- Each catalog entity shows: extracted value, confidence badge, select dropdown (Create New + existing matches sorted by confidence)
- "Confirm & Save": creates/links company, creates/matches catalog entities, stores `confirmedData`, redirects to company detail
- "Reject": marks as rejected, no DB writes, redirects to `/meetings`
- **AC**: Given extraction with `ready_for_review` status, when I confirm, then company is created/linked, catalog entities matched/created, and meeting status becomes `reviewed`. When I reject, no writes occur.

**US-P1-05: Meetings list page** (Size: S)
- `/meetings` with table: Title, Date, Duration, Company (if linked), Status badge
- Sorted by date descending
- Links to review page if `ready_for_review`, otherwise read-only detail
- "Meetings" nav item in sidebar (Mic icon)

**US-P1-06: Retry failed extractions** (Size: S)
- "Retry Extraction" button on meetings with `extraction_failed` status
- Resets to `pending_extraction` and triggers extraction task

**US-P1-07: Enrich companies table** (Size: S)
- Add new nullable columns to `companies` via Drizzle migration
- Display new fields on company detail page when present
- Include in edit company form

### Phase 2: Company Investigation

**US-P2-01: Trigger investigation from company page** (Size: L)
- "Investigate" button on `/companies/[id]`
- Creates `company_briefs` row, triggers Trigger.dev task
- Task scrapes: website (home + about + services via cheerio), tech stack (headers/meta tags), domain WHOIS, social media links
- Each source runs independently (one failure doesn't block others)
- Claude synthesizes all gathered data into a summary
- Status updates: pending → running → completed/failed
- Button shows spinner while running, disabled if already in progress

**US-P2-02: Review investigation with diff view** (Size: L)
- After investigation completes, company page shows "Investigation Results" section
- Diff-style view per field: Field Name | Current Value | Discovered Value | Accept/Ignore
- Green = new info not in record, Yellow = differs from existing, Gray = matches
- "Apply Selected" commits all accepted changes via single server action
- "Missing Info" section lists fields investigation couldn't find (needs follow-up meeting)
- All results preserved in `company_briefs` for audit trail

**US-P2-03: Downloadable company brief** (Size: M)
- "Download Brief" button after investigation completes
- Includes: company info, industry/niche, products/services, tech stack, investigation findings, linked projects, gaps section
- Markdown rendered in-browser + "Download as PDF" via browser print
- Generation timestamp included

### Phase 3: Blueprint Matching & Project Reuse

**US-P3-01: Generate embeddings for projects** (Size: L)
- Trigger.dev task generates embedding via OpenAI `text-embedding-3-small`
- Input text: project name + description + company industry/niche + tool names + blueprint name
- Triggered when project status → `completed`, or manually via "Generate Embedding" button
- Stored in `project_embeddings` table

**US-P3-02: Find similar projects when creating new one** (Size: L)
- "Find Similar Projects" button in new project form (after entering name + description + company)
- Generates transient embedding, runs cosine similarity search (`<=>` operator)
- Shows top 5 matches: project name, company name, similarity %, tools, blueprint, outcome rating
- Projects with `outcomeRating >= 4` highlighted as "recommended"
- Each result has "Use as Template" button

**US-P3-03: Auto-populate from matched template** (Size: M)
- "Use as Template" copies: description (editable), project_tools entries, linked blueprint
- Note stored: "Created from template: [source project] (similarity: X%)"
- User confirms and can modify before final creation

**US-P3-04: Rate completed projects** (Size: S)
- When project status = `completed`, show "Outcome Rating" section
- 5-star rating UI + optional outcome text field
- Rating used as weighting factor in future similarity search: `similarity * (rating / 5.0)`

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
| `OPENAI_API_KEY` | Yes | Yes | Yes |
| `TRIGGER_SECRET_KEY` | Yes | N/A | Yes |
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

### Trigger.dev Task Structure

```
src/trigger/
  sync-fireflies.ts           Scheduled: poll Fireflies every 15 min
  extract-meeting.ts           Task: Claude extraction per meeting
  investigate-company.ts       Task: web scraping + brief generation
  generate-embedding.ts        Task: OpenAI embedding generation
  lib/
    fireflies-client.ts        Fireflies GraphQL client
    extract-meeting-data.ts    Claude extraction logic + schema
    investigation/
      scrape-website.ts        Website scraping + parsing
      check-tech-stack.ts      Tech stack detection
      fetch-domain-info.ts     WHOIS domain lookup
      find-social-media.ts     Social media link extraction
      synthesize-brief.ts      Claude brief synthesis
```

### New Dependencies

**Root `package.json`** (Trigger.dev tasks):
- `@anthropic-ai/sdk` — Claude API
- `openai` — Embeddings
- `cheerio` — HTML parsing
- `whois-json` — Domain lookup

**`web/package.json`** (Next.js):
- `openai` — Query-time embedding generation for similarity search

### Cost Estimate

| Service | Monthly |
|---|---|
| Supabase Pro | $25 |
| Vercel Hobby | $0 |
| Trigger.dev Free | $0 |
| Claude API (~100 extractions) | ~$5-25 |
| Fireflies Business | $19/seat |
| Sentry Free | $0 |
| **Total** | **~$50-70** |

---

## New Web Pages & Components

### Pages
- `web/src/app/(dashboard)/meetings/page.tsx` — Meetings list
- `web/src/app/(dashboard)/meetings/[id]/review/page.tsx` — Extraction review (the big one)
- `web/src/app/(dashboard)/companies/[id]/brief/page.tsx` — Investigation results + diff view

### Components
- `web/src/components/meetings/meeting-table.tsx` — Status-filtered table
- `web/src/components/meetings/extraction-review.tsx` — Interactive review form
- `web/src/components/meetings/confidence-badge.tsx` — Color-coded confidence display
- `web/src/components/briefs/brief-diff.tsx` — Current vs discovered diff view
- `web/src/components/briefs/brief-section.tsx` — Expandable brief section
- `web/src/components/projects/similar-projects.tsx` — Similarity search results
- `web/src/components/projects/outcome-form.tsx` — Star rating + outcome text
- `web/src/components/forms/investigate-button.tsx` — Trigger investigation

### Sidebar Update
Add between Companies and Projects:
```typescript
{ label: "Meetings", icon: Mic, href: "/meetings" },
```

---

## Critical Files

| File | Action | Why |
|---|---|---|
| `web/src/lib/schema.ts` | Modify | Add all new tables + columns |
| `src/db/schema.ts` | Modify | Mirror schema changes (keep in sync) |
| `web/src/lib/ids.ts` + `src/utils/id.ts` | Modify | Add new prefixes (mt, mx, cb, pe) |
| `web/src/lib/queries.ts` | Modify | Add meeting, brief, embedding queries |
| `web/src/lib/actions.ts` | Modify | Add confirmation, investigation, outcome actions |
| `web/src/lib/db.ts` | Modify | Add `prepare: false` for Vercel |
| `web/src/components/sidebar.tsx` | Modify | Add Meetings nav item |
| `web/src/app/(dashboard)/companies/[id]/page.tsx` | Modify | Add Investigate button, enriched fields |
| `src/trigger/example.ts` | Reference | Pattern for new Trigger.dev tasks |
| `trigger.config.ts` | Modify | Add `build.external` if needed |
| `.github/workflows/ci.yml` | Rewrite | Full CI/CD pipeline |

---

## Out of Scope

- Real-time Fireflies webhooks (polling is sufficient)
- Multi-user auth / RBAC (single user)
- Full transcript storage (summary + reference ID only)
- Automatic investigation on import (always manual trigger)
- Real-time embedding updates (on completion or manual only)
- Custom AI model fine-tuning
- Billing, invoicing, or CRM features
- Mobile-responsive UI (desktop-first)
- Email/Slack notifications

---

## Success Metrics

| Metric | Target | Measurement |
|---|---|---|
| Meeting-to-company time | < 2 min (from 15-30 min) | Time from sync to confirmed record |
| Extraction accuracy | > 85% fields accepted without editing | Compare `confirmedData` vs `rawExtraction` |
| Company profile completeness | > 80% fields filled after Phase 1 + 2 | Non-null fields / total fields |
| Project template reuse rate | > 50% of new projects use template | Template-sourced projects / total |
| Zero accidental DB writes | 0 unconfirmed AI writes | All extractions must go through review |

---

## Verification Plan

### Phase 0
1. Visit `https://your-app.vercel.app` — dashboard loads
2. Trigger.dev dashboard shows deployed tasks
3. `/api/health` returns `{ status: "healthy" }`
4. GitHub push triggers CI and Vercel deploy

### Phase 1
1. Add Fireflies API key → poll task runs → meetings appear in `/meetings`
2. Click a meeting → review page shows extracted data with confidence badges
3. Edit a field, select existing industry from dropdown → "Confirm & Save"
4. Company created/linked → redirected to company detail page with all data
5. Reject a meeting → no DB changes, status = rejected

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
