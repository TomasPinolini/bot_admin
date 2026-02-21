import { nanoid } from "nanoid";

const PREFIXES = {
  company: "co",
  project: "pj",
  tool: "tl",
  blueprint: "bp",
  industry: "in",
  niche: "ni",
  product: "pd",
  service: "sv",
  companyIndustry: "ci",
  companyNiche: "cn",
  companyProduct: "cp",
  companyService: "cs",
} as const;

type EntityType = keyof typeof PREFIXES;

export function generateId(entity: EntityType): string {
  return `${PREFIXES[entity]}_${nanoid(12)}`;
}
