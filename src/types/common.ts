import { z } from "zod";

export const statusEnum = z.enum(["active", "inactive", "archived"]);
export type Status = z.infer<typeof statusEnum>;

export const projectStatusEnum = z.enum([
  "planning",
  "in_progress",
  "review",
  "completed",
  "on_hold",
  "cancelled",
]);
export type ProjectStatus = z.infer<typeof projectStatusEnum>;

export const projectPhaseEnum = z.enum([
  "discovery",
  "design",
  "build",
  "test",
  "deploy",
  "handoff",
]);
export type ProjectPhase = z.infer<typeof projectPhaseEnum>;

export const implTypeEnum = z.enum(["prompt", "config", "api_ref", "note"]);
export type ImplType = z.infer<typeof implTypeEnum>;

export const toolCategoryEnum = z.enum([
  "ai_platform",
  "api",
  "messaging",
  "analytics",
  "crm",
  "payment",
  "hosting",
  "other",
]);
export type ToolCategory = z.infer<typeof toolCategoryEnum>;
