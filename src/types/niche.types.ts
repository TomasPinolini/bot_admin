import { z } from "zod";

export const createNicheSchema = z.object({
  industryId: z.string().min(1, "Industry is required"),
  name: z.string().min(1, "Niche name is required"),
  description: z.string().optional(),
});
export type CreateNicheInput = z.infer<typeof createNicheSchema>;

export const listNichesSchema = z.object({
  industryId: z.string().optional(),
  search: z.string().optional(),
});
export type ListNichesFilter = z.infer<typeof listNichesSchema>;
