# Phase 5: Progress Tracking

**Goal:** Log progress entries against projects to build a timeline of what happened and when.

**User Stories Covered:** US-07, US-08

## Project Phases

Progress logs reference a phase of work:

| Phase | Description |
|-------|-------------|
| `discovery` | Understanding client needs, gathering requirements |
| `design` | Designing the solution, conversation flows, architecture |
| `build` | Implementing the chatbot, writing prompts, configuring tools |
| `test` | Testing with the client, iterating on feedback |
| `deploy` | Going live, production deployment |
| `handoff` | Training the client, documentation, support transition |

## Commands

### `bot progress log`

Logs a progress entry for a project.

**Flags:**
- `--project <id>` (required) — Project ID
- `--phase <phase>` (required) — Which phase this entry relates to
- `--note <text>` — What happened
- `--by <name>` — Who logged this (your name)

Each log gets a timestamp automatically.

### `bot progress timeline <projectId>`

Shows the full progress timeline for a project in reverse chronological order (newest first).

**Output:** Table with Date, Phase, Status, Note, By.

## Design Notes

- Progress logs are **append-only** — you don't edit or delete them, you add new ones
- Each log has a `status` field (defaults to `in_progress`, can be `completed` or `blocked`)
- The timeline gives a clear audit trail of project activity
- `logged_by` is a freeform string (no user accounts in MVP)

## Service Layer

`progress.service.ts` exposes:
- `createProgressLog(input)` — Generates `pg_` prefixed ID, auto-timestamps
- `getTimeline(projectId)` — Returns all logs for a project, newest first

## How to Verify

```bash
npm run dev -- progress log --project <id> --phase discovery --note "Initial client call, gathered requirements" --by "Tom"
npm run dev -- progress log --project <id> --phase design --note "Designed conversation flow for appointment booking" --by "Tom"
npm run dev -- progress log --project <id> --phase build --note "Integrated Voiceflow with client's calendar API" --by "Partner"
npm run dev -- progress timeline <id>
```

The timeline should show all 3 entries in reverse order with timestamps.
