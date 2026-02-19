# Phase 1: Company Management

**Goal:** CRUD for client companies — the core entity everything else hangs off of.

**User Stories Covered:** US-01, US-02, US-03, US-14 (partial)

## Commands

### `bot company add`

Creates a new company record. Supports both flag mode and interactive mode.

**Flags:**
- `--name` (required) — Company name
- `--industry` (required) — Industry (e.g. "healthcare", "real estate")
- `--niche` (optional) — Specific niche within industry (e.g. "dental")
- `--contact-name`, `--contact-email`, `--contact-phone` — Contact info
- `--website` — Company website URL
- `--notes` — Freeform notes

**Interactive mode:** Omit flags and get guided prompts for each field.

**Output:** Displays the new company's ID, name, and industry.

### `bot company list`

Lists all active companies in a formatted table.

**Filters:**
- `--industry <term>` — Fuzzy match on industry
- `--status <active|inactive|archived>` — Filter by status
- `--search <term>` — Fuzzy search across name, industry, niche

**Output:** Table with ID, Name, Industry, Niche, Status, Created date.

### `bot company show <id-or-name>`

Shows full details for a single company. Accepts either the `co_xxxx` ID or exact company name.

**Output:** All fields displayed as labeled key-value pairs.

### `bot company edit <id>`

Updates an existing company. Like `add`, supports both flag mode and interactive mode.

**Flag mode:** Pass only the fields you want to change.
**Interactive mode:** Omit flags to get prompts pre-filled with current values.

## Service Layer

`company.service.ts` exposes:
- `createCompany(input)` — Validates with Zod, generates `co_` prefixed ID, inserts
- `listCompanies(filter)` — Builds dynamic WHERE clause, filters soft-deleted
- `getCompany(idOrName)` — Tries ID match first, falls back to exact name match
- `updateCompany(id, input)` — Partial update, auto-sets `updatedAt`

## Data Flow

```
CLI flags/prompts → command handler → Zod validation → service function → Drizzle query → PostgreSQL
                                                                                    ↓
CLI formatted output ← command handler ← service result ←─────────────────────────────
```

## How to Verify

```bash
npm run dev -- company add --name "Test Dental" --industry "healthcare" --niche "dental"
npm run dev -- company list
npm run dev -- company list --industry healthcare
npm run dev -- company show "Test Dental"
npm run dev -- company edit <id> --status inactive
```
