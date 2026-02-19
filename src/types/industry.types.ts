import { z } from "zod";

export const createIndustrySchema = z.object({
  name: z.string().min(1, "Industry name is required"),
  description: z.string().optional(),
});
export type CreateIndustryInput = z.infer<typeof createIndustrySchema>;

export const listIndustriesSchema = z.object({
  search: z.string().optional(),
});
export type ListIndustriesFilter = z.infer<typeof listIndustriesSchema>;
