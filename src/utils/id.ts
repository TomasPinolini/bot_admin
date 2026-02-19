import { nanoid } from "nanoid";

const PREFIXES = {
  company: "co",
  project: "pj",
  tool: "tl",
  impl: "im",
  progress: "pg",
  blueprint: "bp",
  blueprintStep: "bs",
  blueprintTool: "bt",
  projectTool: "pt",
} as const;

type EntityType = keyof typeof PREFIXES;

export function generateId(entity: EntityType): string {
  return `${PREFIXES[entity]}_${nanoid(12)}`;
}
