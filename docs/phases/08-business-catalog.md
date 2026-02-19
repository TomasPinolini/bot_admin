# Phase 8: Business Catalog — Industries, Niches, Products, Services

**Status: Done**

## What Changed

Replaced freeform `industry`/`niche` text fields on `companies` and `targetIndustry`/`targetNiche` on `blueprints` with a normalized reference-data layer.

### New Tables (4 entity + 6 junction)

| Table | ID Prefix | Purpose |
|:------|:----------|:--------|
| `industries` | `in_` | Industry catalog (unique name) |
| `niches` | `ni_` | Niche catalog (belongs to industry, composite unique) |
| `products` | `pd_` | Product catalog (unique name) |
| `services` | `sv_` | Service catalog (unique name) |
| `company_industries` | `ci_` | Company ↔ Industry junction |
| `company_niches` | `cn_` | Company ↔ Niche junction |
| `company_products` | `cp_` | Company ↔ Product junction (with notes) |
| `company_services` | `cs_` | Company ↔ Service junction (with notes) |
| `blueprint_industries` | `bi_` | Blueprint ↔ Industry junction |
| `blueprint_niches` | `bn_` | Blueprint ↔ Niche junction |

### Removed Columns

- `companies.industry` (text)
- `companies.niche` (text)
- `blueprints.target_industry` (text)
- `blueprints.target_niche` (text)

### New Files

- `src/types/industry.types.ts`, `src/services/industry.service.ts`, `src/commands/industry.ts`
- `src/types/niche.types.ts`, `src/services/niche.service.ts`, `src/commands/niche.ts`
- `src/types/product.types.ts`, `src/services/product.service.ts`, `src/commands/product.ts`
- `src/types/service.types.ts`, `src/services/service.service.ts`, `src/commands/service.ts`

### Modified Files

- `src/utils/id.ts` — 10 new prefixes
- `src/db/schema.ts` — 10 new tables, removed columns
- `src/types/company.types.ts` — removed industry/niche, added assign schemas
- `src/services/company.service.ts` — junction helpers, enriched getCompany
- `src/types/blueprint.types.ts` — removed targetIndustry/targetNiche, added assign schemas
- `src/services/blueprint.service.ts` — junction helpers, enriched getBlueprint
- `src/commands/company.ts` — removed industry/niche flags, added assign subcommands
- `src/commands/blueprint.ts` — removed industry/niche flags, added assign subcommands
- `src/index.ts` — registered 4 new command groups
- `src/menu/index.ts` — Business Catalog sub-menu, updated company/blueprint menus

## Verification

```bash
bot industry add --name "Healthcare"
bot niche add --industry "Healthcare" --name "Dental"
bot product add --name "AI Receptionist"
bot service add --name "Full Implementation"
bot company add --name "Bright Smile Dental"
bot company assign-industry <co-id> --industry "Healthcare"
bot company show <co-id>
```
