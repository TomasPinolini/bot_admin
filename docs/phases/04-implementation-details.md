# Phase 4: Implementation Details

**Goal:** Document the actual work — prompts, configs, API references, and notes — attached to each project.

**User Stories Covered:** US-04, US-05

## Implementation Types

Each implementation detail has a `type` field:

| Type | Purpose | Example |
|------|---------|---------|
| `prompt` | System prompts, user prompt templates | "You are a dental receptionist AI..." |
| `config` | Configuration values, settings | API keys, model parameters, temperature settings |
| `api_ref` | API endpoint references, webhook URLs | "POST /api/v1/appointments" |
| `note` | General notes, decisions, learnings | "Client prefers formal tone" |

## Commands

### `bot impl add`

Adds an implementation detail to a project.

**Flags:**
- `--project <id>` (required) — Project ID
- `--type <type>` (required) — One of: prompt, config, api_ref, note
- `--title <title>` (required) — Short title
- `--content <content>` (required) — The actual content (prompt text, config value, etc.)

### `bot impl list --project <id>`

Lists all implementation details for a project.

**Filters:**
- `--type <type>` — Filter by type (e.g. show only prompts)

**Output:** Table with ID, Type, Title, Created date. Ordered by `sort_order` then `created_at`.

### `bot impl show <id>`

Shows the full implementation detail including the content body.

**Output:** Metadata labels followed by the full content block.

## Data Design

- `metadata_json` (JSONB) — Flexible key-value store for extra metadata (model name, version, etc.)
- `sort_order` — Integer for manual ordering within a project
- Soft deletes via `deleted_at`

## Service Layer

`impl.service.ts` exposes:
- `createImpl(input)` — Generates `im_` prefixed ID
- `listImpls(filter)` — Filters by project + optional type, ordered by sort_order
- `getImpl(id)` — Single detail with all fields
- `updateImpl(id, input)` — Partial update

## How to Verify

```bash
npm run dev -- impl add --project <id> --type prompt --title "System Prompt v1" --content "You are a friendly dental receptionist AI assistant..."
npm run dev -- impl add --project <id> --type config --title "Model Settings" --content "model: gpt-4o, temperature: 0.7, max_tokens: 2000"
npm run dev -- impl add --project <id> --type api_ref --title "Appointment API" --content "POST https://api.example.com/appointments"
npm run dev -- impl list --project <id>
npm run dev -- impl list --project <id> --type prompt
npm run dev -- impl show <impl-id>
```
