import { z } from "zod";
import { projectPhaseEnum } from "./common.js";

export const createProgressLogSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  phase: projectPhaseEnum,
  status: z.enum(["in_progress", "completed", "blocked"]).optional(),
  note: z.string().optional(),
  loggedBy: z.string().optional(),
});
export type CreateProgressLogInput = z.infer<typeof createProgressLogSchema>;
