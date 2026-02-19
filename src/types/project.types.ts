import { z } from "zod";
import { projectStatusEnum } from "./common.js";

export const createProjectSchema = z.object({
  companyId: z.string().min(1, "Company ID is required"),
  name: z.string().min(1, "Project name is required"),
  description: z.string().optional(),
  startDate: z.string().optional(),
  targetDate: z.string().optional(),
});
export type CreateProjectInput = z.infer<typeof createProjectSchema>;

export const updateProjectSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  status: projectStatusEnum.optional(),
  startDate: z.string().optional(),
  targetDate: z.string().optional(),
  completedDate: z.string().optional(),
});
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

export const listProjectsSchema = z.object({
  companyId: z.string().optional(),
  status: projectStatusEnum.optional(),
  search: z.string().optional(),
});
export type ListProjectsFilter = z.infer<typeof listProjectsSchema>;

export const assignToolSchema = z.object({
  projectId: z.string().min(1),
  toolId: z.string().min(1),
  configJson: z.record(z.unknown()).optional(),
  notes: z.string().optional(),
});
export type AssignToolInput = z.infer<typeof assignToolSchema>;
