import { z } from "zod";
import { toolCategoryEnum } from "./common.js";

export const createToolSchema = z.object({
  name: z.string().min(1, "Tool name is required"),
  category: toolCategoryEnum.optional(),
  url: z.string().url().optional().or(z.literal("")),
  description: z.string().optional(),
});
export type CreateToolInput = z.infer<typeof createToolSchema>;

export const listToolsSchema = z.object({
  category: toolCategoryEnum.optional(),
  search: z.string().optional(),
});
export type ListToolsFilter = z.infer<typeof listToolsSchema>;
