# Bot Admin CLI — Architecture & Data Model

## Overview

Bot Admin is a CLI tool for managing AI chatbot implementations, clients, and reusable blueprints. It runs against a shared Supabase PostgreSQL database so both team members see the same data.

---

## Tech Stack

| Component | Choice |
|:----------|:-------|
| Runtime | Node.js + TypeScript (ESM) |
| CLI | Commander.js + @clack/prompts |
| Database | Supabase (hosted PostgreSQL) |
| ORM | Drizzle ORM + drizzle-kit |
| Validation | Zod |
| IDs | nanoid with entity prefixes |
| Output | chalk + cli-table3 |

---

## Data Model

### Core Entities

```
companies                        projects                         progress_logs
─────────────────────────        ─────────────────────────        ─────────────────────────
 id            PK (co_)           id            PK (pj_)           id            PK (pg_)
 name          unique             company_id    FK → companies     project_id    FK → projects
 contact_name                     name                             phase
 contact_email                    description                      status
 contact_phone                    status                           note
 website                          start_date                       logged_by
 notes                            target_date                      logged_at
 status                           completed_date                   created_at
 created_at                       created_at
 updated_at                       updated_at
 deleted_at                       deleted_at
```

### Business Catalog (Reference Data)

```
industries                       niches
─────────────────────────        ─────────────────────────
 id            PK (in_)           id            PK (ni_)
 name          unique             industry_id   FK → industries
 description                      name
 created_at                       description
 deleted_at                       created_at
                                   deleted_at
                                   unique(industry_id, name)

products                         services
─────────────────────────        ─────────────────────────
 id            PK (pd_)           id            PK (sv_)
 name          unique             name          unique
 description                      description
 created_at                       created_at
 deleted_at                       deleted_at
```

### Company Junctions

```
company_industries (ci_)         company_niches (cn_)
 company_id  FK → companies       company_id  FK → companies
 industry_id FK → industries      niche_id    FK → niches

company_products (cp_)           company_services (cs_)
 company_id  FK → companies       company_id  FK → companies
 product_id  FK → products        service_id  FK → services
 notes                             notes
```

### Tools & Project-Tool Junction

```
tools                            project_tools (pt_)
─────────────────────────        ─────────────────────────
 id            PK (tl_)           id            PK
 name          unique             project_id    FK → projects
 category                         tool_id       FK → tools
 url                              config_json
 description                      notes
 created_at                       created_at
 deleted_at
```

### Implementation Details

```
implementation_details (im_)
─────────────────────────
 id            PK
 project_id    FK → projects
 type          prompt | config | api_ref | note
 title
 content
 metadata_json
 sort_order
 created_at
 updated_at
 deleted_at
```

### Blueprints

```
blueprints (bp_)                 blueprint_steps (bs_)            blueprint_tools (bt_)
─────────────────────────        ─────────────────────────        ─────────────────────────
 id            PK                 id            PK                 id            PK
 name          unique             blueprint_id  FK → blueprints    blueprint_id  FK → blueprints
 description                      step_order                       tool_id       FK → tools
 created_at                       title                            role_in_blueprint
 updated_at                       description                      notes
 deleted_at                       created_at                       created_at
                                   updated_at

blueprint_industries (bi_)       blueprint_niches (bn_)
 blueprint_id FK → blueprints     blueprint_id FK → blueprints
 industry_id  FK → industries     niche_id     FK → niches
```

### Key Design Decisions

- **Niches are hierarchical** — each niche belongs to one industry. Composite unique on `(industry_id, name)`
- **Products/Services are reusable** — global catalog linked to companies via junction tables with optional notes
- **Blueprints use junction tables** — industries/niches linked via `blueprint_industries`/`blueprint_niches`
- **Soft deletes** — `deleted_at` on all primary entities
- **IDs** — nanoid with entity prefixes (`co_`, `in_`, `ni_`, `pd_`, `sv_`, etc.)

---

## CLI Commands

Pattern: `bot <entity> <action> [args] [--flags]`

Every command supports **flag mode** (scriptable) and **interactive mode** (prompts when flags omitted).

```bash
# Companies
bot company add          [--name "Acme"]
bot company list         [--status active --search "term"]
bot company show         <id-or-name>
bot company edit         <id> [--name "New Name" --status "inactive"]
bot company assign-industry <id> [--industry "Healthcare"]
bot company assign-niche    <id> [--niche "Dental"]
bot company assign-product  <id> [--product "AI Receptionist"]
bot company assign-service  <id> [--service "Full Implementation"]

# Business Catalog
bot industry add     [--name "Healthcare"]
bot industry list    [--search "term"]
bot industry show    <id-or-name>

bot niche add        [--industry "Healthcare" --name "Dental"]
bot niche list       [--industry "Healthcare" --search "term"]
bot niche show       <id-or-name>

bot product add      [--name "AI Receptionist"]
bot product list     [--search "term"]
bot product show     <id-or-name>

bot service add      [--name "Full Implementation"]
bot service list     [--search "term"]
bot service show     <id-or-name>

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
bot tool show    <id-or-name>

# Implementation Details
bot impl add     --project <id> --type "prompt" --title "System Prompt"
bot impl list    --project <id> [--type "prompt"]
bot impl show    <id>

# Progress
bot progress log       --project <id> --phase "build" --note "Integrated Voiceflow"
bot progress timeline  <project-id>

# Blueprints
bot blueprint add            [--name "Dental Bot Blueprint"]
bot blueprint list           [--search "term"]
bot blueprint show           <id>
bot blueprint add-step       <bp-id> --order 1 --title "Setup"
bot blueprint add-tool       <bp-id> --tool <tool-id>
bot blueprint assign-industry <bp-id> [--industry "Healthcare"]
bot blueprint assign-niche    <bp-id> [--niche "Dental"]
bot blueprint apply          <bp-id> --company <id>
```

---

## Interactive Menu

Run `npm run dev` (no args) for interactive mode:

```
Main Menu
├── Companies        (add, list, edit, assign-industry/niche/product/service)
├── Projects         (add, list, advance, status, assign-tool)
├── Tools            (add, list)
├── Business Catalog
│   ├── Industries   (add, list)
│   ├── Niches       (add, list)
│   ├── Products     (add, list)
│   └── Services     (add, list)
├── Implementation Details  (add, list)
├── Progress                (log, timeline)
├── Blueprints       (add, list, add-step, add-tool, assign-industry/niche, apply)
└── Exit
```

---

## Project Structure

```
src/
├── index.ts                    # Entry point (CLI or menu)
├── commands/                   # CLI command handlers
│   ├── company.ts
│   ├── project.ts
│   ├── tool.ts
│   ├── impl.ts
│   ├── progress.ts
│   ├── blueprint.ts
│   ├── industry.ts
│   ├── niche.ts
│   ├── product.ts
│   └── service.ts
├── services/                   # Business logic
│   ├── company.service.ts
│   ├── project.service.ts
│   ├── tool.service.ts
│   ├── impl.service.ts
│   ├── progress.service.ts
│   ├── blueprint.service.ts
│   ├── industry.service.ts
│   ├── niche.service.ts
│   ├── product.service.ts
│   └── service.service.ts
├── db/
│   ├── index.ts                # Drizzle client (lazy init)
│   └── schema.ts               # All table definitions
├── types/                      # Zod schemas + TypeScript types
│   ├── common.ts
│   ├── company.types.ts
│   ├── project.types.ts
│   ├── tool.types.ts
│   ├── impl.types.ts
│   ├── progress.types.ts
│   ├── blueprint.types.ts
│   ├── industry.types.ts
│   ├── niche.types.ts
│   ├── product.types.ts
│   └── service.types.ts
├── utils/
│   ├── id.ts
│   ├── date.ts
│   ├── config.ts
│   └── format.ts
├── ui/
│   ├── prompts.ts
│   └── display.ts
└── menu/
    └── index.ts                # Interactive menu system
```

### Module Boundaries

```
commands/  →  services/  →  db/       (commands never touch db directly)
commands/  →  ui/                     (commands use prompts/display)
services/  →  types/                  (services validate with Zod)
menu/      →  services/ + ui/         (menu uses services and prompts)
utils/     is a leaf                  (imported by anyone)
```
