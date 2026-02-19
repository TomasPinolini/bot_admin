# Phase 6: Blueprints

**Goal:** Distill successful implementations into reusable templates that can be applied to new clients in the same niche.

**User Stories Covered:** US-11, US-12, US-13

## What Is a Blueprint?

A blueprint is a reusable playbook for a specific type of engagement. It captures:

- **Metadata** — Name, description, target industry/niche
- **Steps** — Ordered list of steps to follow (like a checklist)
- **Tools** — Which tools from the registry are needed, and what role each plays

When applied to a company, a blueprint auto-creates a project with the tools pre-assigned.

## Commands

### `bot blueprint add`

Creates a new blueprint.

**Flags:**
- `--name` (required) — Blueprint name (e.g. "Dental Reception Bot")
- `--description` — What this blueprint covers
- `--industry` — Target industry
- `--niche` — Target niche

### `bot blueprint list`

Lists all blueprints.

**Filters:**
- `--industry <term>` — Filter by target industry
- `--niche <term>` — Filter by target niche
- `--search <term>` — Search name/description

### `bot blueprint show <id>`

Shows full blueprint details including all steps and assigned tools.

### `bot blueprint add-step <blueprintId>`

Adds an ordered step to a blueprint.

**Flags:**
- `--order <n>` (required) — Step number (1, 2, 3...)
- `--title` (required) — Step title
- `--description` — Detailed description

### `bot blueprint add-tool <blueprintId>`

Associates a tool from the registry with this blueprint.

**Flags:**
- `--tool <id-or-name>` (required) — Tool to associate
- `--role` — Role this tool plays in the blueprint (e.g. "conversation builder", "telephony")
- `--notes` — Additional notes

### `bot blueprint apply <blueprintId>`

**The key command.** Applies a blueprint to a company by:

1. Creating a new project for that company (name defaults to blueprint name)
2. Assigning all blueprint tools to the new project

**Flags:**
- `--company <id-or-name>` (required) — Target company
- `--project-name` — Override the auto-generated project name

## Data Design

- `blueprints` — Core blueprint metadata with `bp_` ID prefix
- `blueprint_steps` — Ordered steps with `bs_` ID prefix
- `blueprint_tools` — Junction to tools with `bt_` ID prefix and `role_in_blueprint` field

## Service Layer

`blueprint.service.ts` exposes:
- `createBlueprint(input)` — Generates `bp_` ID
- `listBlueprints(filter)` — Fuzzy search on industry/niche/name
- `getBlueprint(id)` — Returns blueprint + all steps + all tools (with names)
- `addStep(input)` — Adds ordered step
- `addTool(input)` — Links a tool to the blueprint
- `applyBlueprint(input)` — Creates project + assigns tools in a single operation

## Example Workflow

```bash
# 1. Create the blueprint
npm run dev -- blueprint add --name "Dental Reception Bot" --industry "healthcare" --niche "dental"

# 2. Add steps
npm run dev -- blueprint add-step <bp-id> --order 1 --title "Discovery Call" --description "Understand office workflow, peak hours, appointment types"
npm run dev -- blueprint add-step <bp-id> --order 2 --title "Build Conversation Flow" --description "Create Voiceflow project with appointment booking flow"
npm run dev -- blueprint add-step <bp-id> --order 3 --title "Integrate Calendar" --description "Connect to client's scheduling system via API"
npm run dev -- blueprint add-step <bp-id> --order 4 --title "Test & Iterate" --description "Run test calls, gather feedback, refine"
npm run dev -- blueprint add-step <bp-id> --order 5 --title "Deploy & Handoff" --description "Go live, train staff, document"

# 3. Assign tools
npm run dev -- blueprint add-tool <bp-id> --tool Voiceflow --role "Conversation builder"
npm run dev -- blueprint add-tool <bp-id> --tool "OpenAI API" --role "Language model"

# 4. Review
npm run dev -- blueprint show <bp-id>

# 5. Apply to a new client
npm run dev -- blueprint apply <bp-id> --company "New Dental Office" --project-name "Reception Bot Setup"

# 6. Verify the new project was created with tools
npm run dev -- project show <new-project-id>
```

## Success Criteria

The goal is to get a new client in the same niche from "signed" to "project created with tools assigned" in under 2 minutes, vs. the previous manual process of recreating everything from scratch.
