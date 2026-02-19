# Phase 2: Tool Registry

**Goal:** A shared registry of tools/platforms/APIs the team uses across all client projects.

**User Stories Covered:** US-09

## Why Tools Are a Separate Entity

Tools like "Voiceflow", "OpenAI API", or "Twilio" are reused across many projects and blueprints. Instead of duplicating tool info inside each project, tools live in their own table and get linked via junction tables (`project_tools`, `blueprint_tools`).

## Commands

### `bot tool add`

Registers a new tool in the registry.

**Flags:**
- `--name` (required) — Tool name (unique)
- `--category` — One of: `ai_platform`, `api`, `messaging`, `analytics`, `crm`, `payment`, `hosting`, `other`
- `--url` — Tool's website/docs URL
- `--description` — What this tool does

### `bot tool list`

Lists all registered tools.

**Filters:**
- `--category <category>` — Filter by category
- `--search <term>` — Fuzzy search name/description

**Output:** Table with ID, Name, Category, URL.

### `bot tool show <id-or-name>`

Shows full details of a single tool. Accepts ID or exact name.

## Service Layer

`tool.service.ts` exposes:
- `createTool(input)` — Generates `tl_` prefixed ID
- `listTools(filter)` — Dynamic filters, excludes soft-deleted
- `getTool(idOrName)` — ID-first lookup with name fallback

## How to Verify

```bash
npm run dev -- tool add --name "Voiceflow" --category "ai_platform" --url "https://voiceflow.com"
npm run dev -- tool add --name "OpenAI API" --category "ai_platform"
npm run dev -- tool add --name "Twilio" --category "messaging"
npm run dev -- tool list
npm run dev -- tool list --category ai_platform
npm run dev -- tool show Voiceflow
```
