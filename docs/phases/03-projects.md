# Phase 3: Projects + Tool Assignment

**Goal:** Create and track projects for companies, assign tools to projects, advance project status through defined stages.

**User Stories Covered:** US-06, US-07, US-08

## Project Lifecycle

Projects move through these statuses in order:

```
planning → in_progress → review → completed
```

Additionally, projects can be set to `on_hold` or `cancelled` at any time via the `status` command.

## Commands

### `bot project add`

Creates a new project linked to a company.

**Flags:**
- `--company <id-or-name>` (required) — The company this project belongs to
- `--name` (required) — Project name (e.g. "AI Receptionist")
- `--description` — What this project is about
- `--start-date` — Start date (YYYY-MM-DD)
- `--target-date` — Target completion date (YYYY-MM-DD)

### `bot project list`

Lists projects with optional filters.

**Filters:**
- `--company <id-or-name>` — Filter by company
- `--status <status>` — Filter by status
- `--search <term>` — Search project names

**Output:** Table with ID, Company, Name, Status, Start, Target.

### `bot project show <id>`

Shows full project details including assigned tools. Displays all project metadata plus a table of tools assigned to this project.

### `bot project advance <id>`

Moves the project to the next status in the lifecycle. If already at `completed`, warns that it can't advance further. Automatically sets `completed_date` when advancing to `completed`.

### `bot project status <id> --set <status>`

Sets the project status directly (useful for `on_hold`, `cancelled`, or jumping statuses).

### `bot project assign-tool <projectId>`

Links a registered tool to a project.

**Flags:**
- `--tool <id-or-name>` (required) — The tool to assign
- `--notes` — How this tool is used in this project

## Service Layer

`project.service.ts` exposes:
- `createProject(input)` — Validates company exists, generates `pj_` ID
- `listProjects(filter)` — Joins with companies for display name
- `getProject(id)` — Returns project + company name
- `updateProject(id, input)` — Partial update
- `advanceProject(id)` — Status state machine
- `assignTool(input)` — Creates `project_tools` junction record with `pt_` ID
- `getProjectTools(projectId)` — Returns tools with names via join

## How to Verify

```bash
npm run dev -- project add --company <company-id> --name "AI Receptionist"
npm run dev -- project list
npm run dev -- project show <project-id>
npm run dev -- project assign-tool <project-id> --tool Voiceflow --notes "Main conversation builder"
npm run dev -- project show <project-id>           # now shows tools
npm run dev -- project advance <project-id>        # planning → in_progress
npm run dev -- project advance <project-id>        # in_progress → review
npm run dev -- project status <project-id> --set on_hold
```
