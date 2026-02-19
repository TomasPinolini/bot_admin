import { z } from "zod";

export const createBlueprintSchema = z.object({
  name: z.string().min(1, "Blueprint name is required"),
  description: z.string().optional(),
});
export type CreateBlueprintInput = z.infer<typeof createBlueprintSchema>;

export const addBlueprintStepSchema = z.object({
  blueprintId: z.string().min(1),
  stepOrder: z.number().int().min(1),
  title: z.string().min(1, "Step title is required"),
  description: z.string().optional(),
});
export type AddBlueprintStepInput = z.infer<typeof addBlueprintStepSchema>;

export const addBlueprintToolSchema = z.object({
  blueprintId: z.string().min(1),
  toolId: z.string().min(1),
  roleInBlueprint: z.string().optional(),
  notes: z.string().optional(),
});
export type AddBlueprintToolInput = z.infer<typeof addBlueprintToolSchema>;

export const applyBlueprintSchema = z.object({
  blueprintId: z.string().min(1),
  companyId: z.string().min(1),
  projectName: z.string().optional(),
});
export type ApplyBlueprintInput = z.infer<typeof applyBlueprintSchema>;

export const listBlueprintsSchema = z.object({
  search: z.string().optional(),
});
export type ListBlueprintsFilter = z.infer<typeof listBlueprintsSchema>;

export const assignBlueprintIndustrySchema = z.object({
  blueprintId: z.string().min(1),
  industryId: z.string().min(1),
});
export type AssignBlueprintIndustryInput = z.infer<typeof assignBlueprintIndustrySchema>;

export const assignBlueprintNicheSchema = z.object({
  blueprintId: z.string().min(1),
  nicheId: z.string().min(1),
});
export type AssignBlueprintNicheInput = z.infer<typeof assignBlueprintNicheSchema>;
