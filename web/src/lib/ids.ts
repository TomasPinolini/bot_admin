import { nanoid } from "nanoid";

const PREFIXES = {
  company: "co",
  project: "pj",
  tool: "tl",
  blueprint: "bp",
} as const;

type EntityType = keyof typeof PREFIXES;

export function generateId(entity: EntityType): string {
  return `${PREFIXES[entity]}_${nanoid(12)}`;
}
